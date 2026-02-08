"""
Script to seed National Coordinators for PhotoCup 2026
Run this script from the backend directory:
    python seed_coordinators.py
"""

import sys
sys.path.insert(0, '.')

from app.db.session import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.core.security import get_password_hash

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

COORDINATORS = [
    ("Argentina", "Cecilia Gabelloni", "cecilia.gabelloni@mensa.org.ar"),
    ("Australia", "Kymberley Wilson", "kymberley@mensa.org.au"),
    ("Australia", "Jean-marc Genesi", "chair@mensa.org.au"),
    ("Austria", "Silvia Wirnsberger", "wirnsberger.silvia@gmail.com"),
    ("Belgium", "Mark van Borm", "chairman@mensa.be"),
    ("Bosnia & Herzegovina", "Valentina Brusin", "valentina.brusin@mensa.ba"),
    ("Brazil", "Cadu Fonseca", "presidencia@mensa.org.br"),
    ("Bulgaria", "Boris Ivanov", "boris.ivanov@lsa-bg.com"),
    ("Bulgaria", "Boris Ivanov", "chairman@mensa.bg"),
    ("Canada", "Rodica Ellison", "photocup@mensacanada.org"),
    ("Canada", "Rodica Ellison", "rodicaellison@gmail.com"),
    ("Croatia", "Krešimir Kružić", "ured@mensa.hr"),
    ("Cyprus", "Christina Angelidou", "info@mensa.org.cy"),
    ("Czech Republic", "Dita Sedláčková", "dita.sedlackova@mensa.cz"),
    ("Denmark", "Ib D. Laustsen", "formand@mensa.dk"),
    ("Finland", "Matti Rasinaho", "matti.rasinaho@mensa.fi"),
    ("France", "Déborah Morata", "concoursphoto@mensa.fr"),
    ("Germany", "Wolf-Dieter Roth", "fotowettbewerb@mensa.de"),
    ("Greece", "Christos Apostolidis", "greekphotocup@mensa.org.gr"),
    ("Hong Kong", "Sylvia Lee", "chairman@mensa.org.hk"),
    ("Hungary", "Judit Stremen", "mensafotopalyazat@gmail.com"),
    ("India", "Imtiyaz Saigara", "mensahq@mensaindia.org"),
    ("Indonesia", "Satriadi Gunawan", "gsatriadi@gmail.com"),
    ("Italy", "Simone Ferrari", "presidente@mensa.it"),
    ("Japan", "Chiharu Kajitsuka", "chair@mensa.jp"),
    ("Luxembourg", "Marcel Cox", "marcel.cox@gmail.com"),
    ("Malaysia", "Aimi Malek", "chairman@mensa.my"),
    ("Mexico", "Cinthia Reyes", "astreyes@gmail.com"),
    ("Montenegro", "Aleksandar Music", "proxy@mensa.me"),
    ("Montenegro", "Danilo Vorotović", "proxy@mensa.me"),
    ("Netherlands", "Krister Horn", "krister13@kpnmail.nl"),
    ("New Zealand", "NZ Coordinator", "chair@mensa.org.nz"),
    ("North Macedonia", "Kire Stojanoski", "kire.stojanoski@gmail.com"),
    ("Norway", "Elisabeth Norland", "fotocup@mensa.no"),
    ("Pakistan", "Hasan Zuberi", "zuberi@gmail.com"),
    ("Peru", "Seikei Camara", "seikei.camara@gmail.com"),
    ("Philippines", "Art Llano", "mensaphil.photo@gmail.com"),
    ("Philippines", "Art Llano", "president@mensaphilippines.org"),
    ("Poland", "Agnieszka Borkowska", "foto-sig@mensa.org.pl"),
    ("Romania", "Andy Jugănaru", "secretar@mensaromania.ro"),
    ("Serbia", "Vlada Marinkovic", "vlada.marinkovic@gmail.com"),
    ("Singapore", "Vickreman Harvey Chettiar", "vickreman.chettiar@live.com"),
    ("Slovakia", "Darina Peterková", "darina.peterkova@mensa.sk"),
    ("Slovenia", "Matjaž Podmiljšak", "matjaz.podmiljsak@mensa.si"),
    ("South Africa", "Riaan Thomson", "chairperson@mensa.org.za"),
    ("South Africa", "Debi Balladon", "admin@mensa.org.za"),
    ("South Korea", "Phil Jae Song", "chairman@mensakorea.org"),
    ("South Korea", "Alexis Jang", "admin@mensakorea.org"),
    ("Spain", "Miguel Juan", "photocup@mensa.es"),
    ("Sweden", "Vendela Normark-Granetoft", "ordforande@mensa.se"),
    ("Switzerland", "Christine Ryser", "photocup@mensa.ch"),
    ("Taiwan", "Ho (Jin) Jizhen", "ho.jizhen@gmail.com"),
    ("Turkey", "Alphan Manas", "alphan.manas@mensa.org.tr"),
    ("UK", "Danielle Spittle", "danielle@mensa.org.uk"),
    ("USA", "Chip Taulbee", "chipt@americanmensa.org"),
]

def seed_coordinators():
    db = SessionLocal()
    created = 0
    skipped = 0
    
    # Default password for all coordinators (they should change it)
    default_password = "PhotoCup2026!"
    hashed_pw = get_password_hash(default_password)
    
    try:
        seen_emails = set()
        for country, name, email in COORDINATORS:
            # Skip duplicates
            if email in seen_emails:
                print(f"⏭️  Skipped (duplicate email in list): {email}")
                skipped += 1
                continue
            seen_emails.add(email)
            
            # Check if user already exists
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                # Update to coordinator if not already
                if existing.role != UserRole.NATIONAL_COORDINATOR:
                    existing.role = UserRole.NATIONAL_COORDINATOR
                    existing.country = country
                    existing.full_name = name
                    print(f"🔄 Updated: {name} ({email}) -> {country}")
                else:
                    print(f"⏭️  Skipped (already exists): {email}")
                    skipped += 1
                continue
            
            # Create new coordinator
            coordinator = User(
                email=email,
                hashed_password=hashed_pw,
                full_name=name,
                country=country,
                role=UserRole.NATIONAL_COORDINATOR,
                is_active=True
            )
            db.add(coordinator)
            created += 1
            print(f"✅ Created: {name} ({email}) -> {country}")
        
        db.commit()
        print(f"\n{'='*50}")
        print(f"✅ Coordinators created: {created}")
        print(f"⏭️  Coordinators skipped: {skipped}")
        print(f"🔑 Default password: {default_password}")
        print(f"{'='*50}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_coordinators()
