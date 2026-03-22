"""
Import PhotoCup 2025 photos + participants from Google Drive into the SQLite DB.
Run from:  photocup-platform/backend/
  python import_2025.py [--dry-run] [--limit N]

What it does:
  1. Reads "Summarise Data of All NMs" from core_data_2025.xlsx
  2. For each row, creates/finds a User (PARTICIPANT) in the DB
  3. Downloads the photo from Google Drive to uploads/
  4. Inserts a Photo record linked to that user
  5. Logs every action; skips duplicates (by reference_id stored in description)
"""

import sys, os, re, io, argparse, hashlib, secrets
# Windows-safe UTF-8 output
if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except AttributeError:
        pass

# ── path setup so we can import app models ────────────────────────────────────
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)

import openpyxl
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.db.session import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.photo import Photo

# Create tables if needed
Base.metadata.create_all(bind=engine)

# ── Google Drive ───────────────────────────────────────────────────────────────
SA_FILE = os.path.join(BACKEND_DIR, 'photocupapp-service-account.json')
if not os.path.exists(SA_FILE):
    SA_FILE = os.path.join(BACKEND_DIR, '..', '..', 'photocupapp-service-account.json')

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
_drive_service = None

def drive():
    global _drive_service
    if _drive_service is None:
        creds = service_account.Credentials.from_service_account_file(SA_FILE, scopes=SCOPES)
        _drive_service = build('drive', 'v3', credentials=creds)
    return _drive_service


def extract_drive_id(url: str) -> str | None:
    """Extract Google Drive file ID from various URL formats."""
    if not url:
        return None
    # /file/d/<ID>
    m = re.search(r'/file/d/([a-zA-Z0-9_-]{10,})', url)
    if m:
        return m.group(1)
    # /open?id=<ID>  or  ?id=<ID>
    m = re.search(r'[?&]id=([a-zA-Z0-9_-]{10,})', url)
    if m:
        return m.group(1)
    return None


def download_drive_file(file_id: str, dest_path: str) -> int:
    """Download a Drive file to dest_path. Returns file size in bytes."""
    request = drive().files().get_media(fileId=file_id)
    fh = io.BytesIO()
    dl = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        _, done = dl.next_chunk()
    data = fh.getvalue()
    with open(dest_path, 'wb') as f:
        f.write(data)
    return len(data)


# ── Password ──────────────────────────────────────────────────────────────────
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
IMPORT_PASSWORD = "PhotoCup2025!"   # default password for all imported users


# ── Excel parsing ─────────────────────────────────────────────────────────────
EXCEL_PATH = os.path.join(BACKEND_DIR, '..', '..', 'drive_docs', 'core_data_2025.xlsx')

def parse_excel():
    """
    Returns list of dicts from the 'Summarise Data of All NMs' sheet.
    Columns (0-indexed after skipping the merged-title row):
      0  S.No | 1 Participant Name | 2 Membership # | 3 Reference ID (enc)
      4  Email | 5 Country | 6 Entry Name | 7 Drive link | 8 Image Title
      9  Exif | 10 Best Story
    """
    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
    ws = wb['Summarise Data of All NMs']

    entries = []
    # Row 1 = merged title, Row 2 = column headers, data from Row 3
    for row in ws.iter_rows(min_row=3, values_only=True):
        if not row[0]:   # empty S.No → skip
            continue
        vals = [str(v).strip() if v is not None else '' for v in row]
        ref_id    = vals[3]
        if not ref_id or ref_id in ('', 'None', 'Reference ID'):
            continue

        name      = vals[1] or 'Unknown'
        mensa_num = vals[2]
        email     = vals[4]
        country   = vals[5]
        entry_name= vals[6]
        drive_url = vals[7]
        title     = vals[8].strip() or ref_id
        exif_text = vals[9]
        best_story= vals[10]

        # Build a synthetic email for rows without one (e.g. Germany)
        if not email or email in ('None', 'Not Mention', ''):
            email = f"{ref_id.lower().replace(' ', '')}@photocup2025.internal"

        file_id = extract_drive_id(drive_url)

        entries.append({
            'ref_id':     ref_id,
            'name':       name,
            'mensa_num':  mensa_num,
            'email':      email.lower(),
            'country':    country,
            'entry_name': entry_name,
            'drive_url':  drive_url,
            'file_id':    file_id,
            'title':      title,
            'exif':       exif_text,
            'best_story': best_story,
        })
    return entries


# ── DB helpers ────────────────────────────────────────────────────────────────
def get_or_create_user(db: Session, entry: dict, dry_run: bool) -> User | None:
    user = db.query(User).filter(User.email == entry['email']).first()
    if user:
        return user
    user = User(
        email          = entry['email'],
        hashed_password= pwd_ctx.hash(IMPORT_PASSWORD),
        full_name      = entry['name'],
        role           = UserRole.PARTICIPANT,
        country        = entry['country'],
        mensa_number   = entry['mensa_num'],
        is_active      = True,
    )
    if not dry_run:
        db.add(user)
        db.flush()
    return user


def photo_already_imported(db: Session, ref_id: str) -> bool:
    """We store ref_id in the description field to detect duplicates."""
    return db.query(Photo).filter(Photo.description.contains(ref_id)).first() is not None


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true', help='Parse & report without touching DB or Drive')
    parser.add_argument('--limit', type=int, default=0, help='Only import first N photos (0 = all)')
    args = parser.parse_args()

    uploads_dir = os.path.join(BACKEND_DIR, 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)

    entries = parse_excel()
    print(f"\nTotal entries in Excel: {len(entries)}")

    if args.dry_run:
        print("\n=== DRY RUN — no changes will be made ===")
        countries = {}
        no_file_id = 0
        for e in entries:
            countries[e['country']] = countries.get(e['country'], 0) + 1
            if not e['file_id']:
                no_file_id += 1
                print(f"  [NO DRIVE ID] {e['ref_id']} | {e['title']} | url: {e['drive_url'][:60]}")
        print(f"\nCountries: {dict(sorted(countries.items()))}")
        print(f"Entries without Drive ID: {no_file_id}")
        return

    db = SessionLocal()
    ok = skipped = errors = 0
    limit = args.limit or len(entries)

    try:
        for i, e in enumerate(entries[:limit]):
            ref_id = e['ref_id']
            print(f"\n[{i+1}/{min(limit,len(entries))}] {ref_id} | {e['title'][:50]}")

            # Skip duplicates
            if photo_already_imported(db, ref_id):
                print(f"  SKIP — already in DB")
                skipped += 1
                continue

            # Get/create user
            user = get_or_create_user(db, e, dry_run=False)

            # Download photo
            if not e['file_id']:
                print(f"  ERROR — no Drive file ID, url: {e['drive_url'][:60]}")
                errors += 1
                continue

            # filename: ref_id + extension guessed from original name or .jpg
            ext = '.jpg'
            orig_name = e['drive_url'].split('/')[-1].split('?')[0]
            for x in ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']:
                if orig_name.lower().endswith(x.lower()):
                    ext = x.lower()
                    break
            safe_ref = re.sub(r'[^a-zA-Z0-9_-]', '_', ref_id)
            filename = f"2025_{safe_ref}{ext}"
            dest_path = os.path.join(uploads_dir, filename)

            if os.path.exists(dest_path):
                file_size = os.path.getsize(dest_path)
                print(f"  File exists locally ({file_size//1024}KB)")
            else:
                try:
                    file_size = download_drive_file(e['file_id'], dest_path)
                    print(f"  Downloaded {file_size//1024}KB -> uploads/{filename}")
                except Exception as ex:
                    print(f"  ERROR downloading: {ex}")
                    errors += 1
                    continue

            # Build description with ref_id and best story
            description = f"[{ref_id}]"
            if e['best_story']:
                description += f" {e['best_story']}"

            photo = Photo(
                title         = e['title'],
                description   = description,
                file_path     = f"uploads/{filename}",
                thumbnail_path= None,
                mime_type     = 'image/jpeg',
                file_size     = file_size,
                owner_id      = user.id,
                country       = e['country'],
                category      = 'Spark of Evolution 2025',
                metadata_exif = {'exif_raw': e['exif'], 'entry': e['entry_name'], 'mensa_number': e['mensa_num']},
            )
            db.add(photo)
            db.commit()
            db.refresh(photo)
            print(f"  -> Photo ID {photo.id} created for user {user.email}")
            ok += 1

    except Exception as ex:
        db.rollback()
        print(f"\nFATAL: {ex}")
        import traceback; traceback.print_exc()
    finally:
        db.close()

    print(f"\n=== DONE ===  imported: {ok}  skipped: {skipped}  errors: {errors}")


if __name__ == '__main__':
    main()
