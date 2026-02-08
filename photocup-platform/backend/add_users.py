"""
Script para añadir usuarios personalizados a la base de datos de PhotoCup 2026
Uso: python add_users.py
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ============================================
# CONFIGURA AQUÍ TUS USUARIOS
# ============================================
USUARIOS_A_CREAR = [
    {
        "email": "carlos@photocup.com",
        "password": "mipassword123",  # Se encriptará automáticamente
        "full_name": "Carlos García",
        "role": "ADMIN",  # Opciones: ADMIN, JUDGE, PARTICIPANT
        "country": "España",
        "mensa_number": "ES-99999"
    },
    {
        "email": "maria@photocup.com",
        "password": "maria456",
        "full_name": "María López",
        "role": "JUDGE",
        "country": "México",
        "mensa_number": "MX-88888"
    },
    {
        "email": "juan@photocup.com",
        "password": "juan789",
        "full_name": "Juan Martínez",
        "role": "PARTICIPANT",
        "country": "Argentina",
        "mensa_number": "AR-77777"
    },
    # Añade más usuarios aquí siguiendo el mismo formato
]


def add_custom_users():
    """Crea los usuarios definidos en USUARIOS_A_CREAR"""
    db = SessionLocal()
    
    try:
        usuarios_creados = 0
        usuarios_existentes = 0
        
        for user_data in USUARIOS_A_CREAR:
            # Verificar si el usuario ya existe
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            
            if existing:
                print(f"⚠️  Usuario {user_data['email']} ya existe. Se omite.")
                usuarios_existentes += 1
                continue
            
            # Mapear el rol de string a enum
            role_map = {
                "ADMIN": UserRole.ADMIN,
                "JUDGE": UserRole.JUDGE,
                "PARTICIPANT": UserRole.PARTICIPANT
            }
            
            # Crear el nuevo usuario
            new_user = User(
                email=user_data["email"],
                hashed_password=pwd_context.hash(user_data["password"]),
                full_name=user_data["full_name"],
                role=role_map.get(user_data["role"].upper(), UserRole.PARTICIPANT),
                country=user_data.get("country", "Global"),
                mensa_number=user_data.get("mensa_number", ""),
                is_active=True
            )
            
            db.add(new_user)
            print(f"✅ Usuario creado: {user_data['email']} ({user_data['role']})")
            usuarios_creados += 1
        
        db.commit()
        
        print(f"\n{'='*60}")
        print(f"📊 RESUMEN:")
        print(f"   ✅ Usuarios nuevos creados: {usuarios_creados}")
        print(f"   ⚠️  Usuarios ya existentes: {usuarios_existentes}")
        print(f"{'='*60}")
        print(f"\n💾 Base de datos: photocup.db")
        print(f"🌐 Puedes iniciar sesión en: http://localhost:5000")
        
    except Exception as e:
        print(f"❌ Error al crear usuarios: {e}")
        db.rollback()
    finally:
        db.close()


def list_all_users():
    """Muestra todos los usuarios actuales en la base de datos"""
    db = SessionLocal()
    
    try:
        users = db.query(User).all()
        
        if not users:
            print("📭 No hay usuarios en la base de datos.")
            return
        
        print(f"\n{'='*80}")
        print(f"👥 USUARIOS ACTUALES EN LA BASE DE DATOS ({len(users)} total)")
        print(f"{'='*80}")
        print(f"{'Email':<30} {'Nombre':<25} {'Rol':<12} {'País':<15}")
        print(f"{'-'*80}")
        
        for user in users:
            print(f"{user.email:<30} {user.full_name:<25} {user.role.value:<12} {user.country or 'N/A':<15}")
        
        print(f"{'='*80}\n")
        
    except Exception as e:
        print(f"❌ Error al listar usuarios: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🎨 PHOTOCUP 2026 - Gestión de Usuarios")
    print("="*60 + "\n")
    
    # Primero mostrar usuarios existentes
    list_all_users()
    
    # Preguntar si desea continuar
    print("📝 Se crearán los usuarios definidos en USUARIOS_A_CREAR")
    respuesta = input("¿Deseas continuar? (s/n): ").strip().lower()
    
    if respuesta in ['s', 'si', 'sí', 'y', 'yes']:
        add_custom_users()
    else:
        print("❌ Operación cancelada.")
