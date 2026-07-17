# Architecture Backend — PneumoIA
**Stack :** FastAPI · PostgreSQL · SQLAlchemy · Alembic · Redis · Celery

---

## Arborescence complète

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                        # Point d'entrée FastAPI, inclusion des routers
│   ├── config.py                      # Settings via pydantic-settings (.env)
│   ├── database.py                    # Connexion SQLAlchemy + session
│   │
│   ├── models/                        # ORM SQLAlchemy (tables PostgreSQL)
│   │   ├── __init__.py
│   │   ├── admin.py                   # Table admins
│   │   ├── medecin.py                 # Table medecins
│   │   ├── document_medecin.py        # Table documents_medecin (multi-upload)
│   │   ├── patient.py                 # Table patients
│   │   ├── acces_patient.py           # Table demandes_acces_patient
│   │   ├── consultation.py            # Table consultations
│   │   ├── diagnostic_ia.py           # Table diagnostics_ia
│   │   ├── feedback_ia.py             # Table feedbacks_ia (avis médecin sur le modèle)
│   │   ├── communaute.py              # Table communautes
│   │   ├── membre_communaute.py       # Table membres_communaute
│   │   ├── publication.py             # Table publications_communaute
│   │   ├── commentaire.py             # Table commentaires
│   │   ├── reaction.py                # Table reactions ( utile / )
│   │   ├── notification.py            # Table notifications
│   │   ├── otp.py                     # Table otp_codes
│   │   ├── audit_log.py               # Table audit_logs
│   │   └── cas_clinique_public.py     # Table cas_cliniques_publics (landing page)
│   │
│   ├── schemas/                       # Pydantic — validation entrée/sortie
│   │   ├── __init__.py
│   │   ├── auth.py                    # RegisterRequest, LoginRequest, OTPVerify, TokenResponse
│   │   ├── admin.py                   # AdminProfile, AdminUpdate, DemandeMedecin
│   │   ├── medecin.py                 # MedecinCreate, MedecinProfile, MedecinUpdate
│   │   ├── document.py                # DocumentUpload, DocumentResponse
│   │   ├── patient.py                 # PatientCreate, PatientUpdate, PatientResponse
│   │   ├── acces.py                   # DemandeAccesCreate, RepondreAcces
│   │   ├── consultation.py            # ConsultationCreate, AvisMedecin, ConsultationResponse
│   │   ├── diagnostic.py              # SymptomesInput, DiagnosticIAResponse, FeedbackIA
│   │   ├── communaute.py              # CommunauteCreate, PublicationCreate, CommentaireCreate
│   │   ├── notification.py            # NotificationResponse
│   │   └── audit.py                   # AuditLogResponse, IAMonitoringStats
│   │
│   ├── routers/                       # Endpoints FastAPI
│   │   ├── __init__.py
│   │   ├── auth.py                    # /api/v1/auth/*
│   │   ├── admin.py                   # /api/v1/admin/*
│   │   ├── medecins.py                # /api/v1/medecins/*
│   │   ├── patients.py                # /api/v1/patients/*
│   │   ├── consultations.py           # /api/v1/consultations/*
│   │   ├── diagnostics.py             # /api/v1/diagnostics/*
│   │   ├── communautes.py             # /api/v1/communautes/*
│   │   ├── notifications.py           # /api/v1/notifications/*
│   │   ├── audit.py                   # /api/v1/audit/*  (médecin seulement)
│   │   └── cas_cliniques.py           # /api/v1/cas-cliniques/*
│   │
│   ├── services/                      # Logique métier
│   │   ├── __init__.py
│   │   ├── auth_service.py            # Inscription, connexion, OTP
│   │   ├── email_service.py           # SendGrid / SMTP (lien connexion, rejet)
│   │   ├── sms_service.py             # Twilio / Orange SMS (notif admin)
│   │   ├── pdf_service.py             # WeasyPrint — génération PDF consultation
│   │   ├── storage_service.py         # Upload fichiers (local dev / S3 prod)
│   │   └── ia_service.py             # Chargement modèle + inférence
│   │
│   ├── core/                          # Sécurité transversale
│   │   ├── __init__.py
│   │   ├── security.py                # JWT (HS256), bcrypt hash
│   │   ├── otp.py                     # Génération OTP 6 chiffres + expiry 5 min
│   │   └── dependencies.py            # get_current_medecin, get_current_admin, etc.
│   │
│   └── ml/                            # Intelligence Artificielle
│       ├── __init__.py
│       ├── model.py                   # Chargement joblib/pickle + prédiction
│       ├── preprocessor.py            # Encodage des symptômes → vecteur
│       ├── explainer.py               # SHAP — importance des features (critères validés)
│       └── artifacts/                 # Fichiers binaires du modèle (gitignored)
│           ├── pneumoia_model.pkl
│           ├── label_encoder.pkl
│           └── feature_names.json
│
├── alembic/                           # Migrations BDD
│   ├── versions/
│   │   └── 0001_initial_schema.py
│   └── env.py
│
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_patients.py
│   ├── test_consultations.py
│   ├── test_ia.py
│   └── test_communautes.py
│
├── .env                               # Variables d'environnement (ne pas committer)
├── .env.example
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

---

## 🗄️ Schéma de base de données

### Table `admins`
```sql
id            UUID  PRIMARY KEY DEFAULT gen_random_uuid()
nom           VARCHAR(100) NOT NULL
email         VARCHAR(150) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
phone         VARCHAR(20)                   -- numéro SMS configurable
created_at    TIMESTAMP DEFAULT NOW()
updated_at    TIMESTAMP
```

### Table `medecins`
```sql
id               UUID  PRIMARY KEY
civilite         VARCHAR(10)
nom              VARCHAR(100)
prenom           VARCHAR(100)
email            VARCHAR(150) UNIQUE NOT NULL
password_hash    VARCHAR(255)
specialite       VARCHAR(100)
numero_rpps      VARCHAR(20) UNIQUE
etablissement    VARCHAR(200)
photo_url        VARCHAR(500)
statut           ENUM('en_attente','valide','rejete','suspendu') DEFAULT 'en_attente'
motif_rejet      TEXT
valide_par       UUID REFERENCES admins(id)
valide_le        TIMESTAMP
created_at       TIMESTAMP DEFAULT NOW()
```

### Table `documents_medecin`
```sql
id            UUID  PRIMARY KEY
medecin_id    UUID  REFERENCES medecins(id) ON DELETE CASCADE
type_document ENUM(
  'diplome_specialisation',
  'diplome_medecine',
  'inscription_ordre',
  'autorisation_exercice',
  'carte_professionnelle',
  'cni'
) NOT NULL
url_fichier   VARCHAR(500) NOT NULL
nom_fichier   VARCHAR(255)
taille_octets INTEGER
mime_type     VARCHAR(100)
created_at    TIMESTAMP DEFAULT NOW()
```

### Table `patients`
```sql
id               UUID  PRIMARY KEY
nom              VARCHAR(100)
prenom           VARCHAR(100)
date_naissance   DATE
sexe             ENUM('M','F','autre')
groupe_sanguin   VARCHAR(5)
allergies        JSONB DEFAULT '[]'       -- ["pénicilline", "arachides", ...]
antecedents      JSONB DEFAULT '[]'       -- antécédents médicaux
religion         VARCHAR(100)
telephone        VARCHAR(20)
email            VARCHAR(150)
created_by       UUID  REFERENCES medecins(id)
created_at       TIMESTAMP DEFAULT NOW()
```

### Table `acces_patient`
```sql
id                    UUID  PRIMARY KEY
patient_id            UUID  REFERENCES patients(id)
medecin_demandeur_id  UUID  REFERENCES medecins(id)
medecin_proprietaire_id UUID REFERENCES medecins(id)
statut                ENUM('en_attente','accorde','refuse')
justificatif_demande  TEXT
motif_refus           TEXT
created_at            TIMESTAMP DEFAULT NOW()
updated_at            TIMESTAMP
```

### Table `consultations`
```sql
id                  UUID  PRIMARY KEY
patient_id          UUID  REFERENCES patients(id)
medecin_id          UUID  REFERENCES medecins(id)
symptomes           JSONB NOT NULL           -- {toux: true, fievre: 3, dyspnee: "moderee", ...}
statut              ENUM('en_attente','terminee') DEFAULT 'en_attente'
avis_medecin        TEXT
prescriptions       JSONB DEFAULT '[]'       -- [{medicament, dose, duree}, ...]
recommandations     TEXT
prochain_rdv        TIMESTAMP
partage             JSONB DEFAULT '{}'       -- {actif: bool, communaute_id: uuid, public: bool}
created_at          TIMESTAMP DEFAULT NOW()
updated_at          TIMESTAMP
```

### Table `diagnostics_ia`
```sql
id                UUID  PRIMARY KEY
consultation_id   UUID  REFERENCES consultations(id) UNIQUE
maladies          JSONB NOT NULL   -- [{nom: "Pneumonie", pct: 87, criteres: [...]}, ...]
recommandations   JSONB            -- [{type: "traitement", detail: "..."}]
etat_patient      ENUM('stable','surveille','urgent','critique')
version_modele    VARCHAR(20)      -- pour suivi des versions
duree_inference_ms INTEGER
created_at        TIMESTAMP DEFAULT NOW()
```

### Table `feedbacks_ia`
```sql
id                  UUID  PRIMARY KEY
diagnostic_id       UUID  REFERENCES diagnostics_ia(id)
medecin_id          UUID  REFERENCES medecins(id)
concordance         BOOLEAN           -- IA avait-elle raison ?
diagnostic_final    VARCHAR(200)      -- diagnostic retenu par le médecin
commentaire         TEXT
created_at          TIMESTAMP DEFAULT NOW()
```

### Table `communautes`
```sql
id           UUID  PRIMARY KEY
nom          VARCHAR(200) NOT NULL
description  TEXT
type         ENUM('publique','privee') DEFAULT 'publique'
specialite   VARCHAR(100)
avatar_url   VARCHAR(500)
createur_id  UUID  REFERENCES medecins(id)
nb_membres   INTEGER DEFAULT 1
nb_cas       INTEGER DEFAULT 0
created_at   TIMESTAMP DEFAULT NOW()
```

### Table `membres_communaute`
```sql
id              UUID  PRIMARY KEY
communaute_id   UUID  REFERENCES communautes(id) ON DELETE CASCADE
medecin_id      UUID  REFERENCES medecins(id)
role            ENUM('createur','admin','membre') DEFAULT 'membre'
statut          ENUM('en_attente','accepte','refuse') DEFAULT 'accepte'
joined_at       TIMESTAMP DEFAULT NOW()
UNIQUE(communaute_id, medecin_id)
```

### Table `publications`
```sql
id              UUID  PRIMARY KEY
communaute_id   UUID  REFERENCES communautes(id) ON DELETE CASCADE
auteur_id       UUID  REFERENCES medecins(id)
consultation_id UUID  REFERENCES consultations(id) NULL   -- si cas partagé
titre           VARCHAR(300)
contenu         TEXT
type            ENUM('cas_clinique','question','article','discussion')
tags            JSONB DEFAULT '[]'
nb_commentaires INTEGER DEFAULT 0
nb_reactions    INTEGER DEFAULT 0
created_at      TIMESTAMP DEFAULT NOW()
```

### Table `commentaires`
```sql
id              UUID  PRIMARY KEY
publication_id  UUID  REFERENCES publications(id) ON DELETE CASCADE
auteur_id       UUID  REFERENCES medecins(id)
contenu         TEXT NOT NULL
created_at      TIMESTAMP DEFAULT NOW()
```

### Table `reactions`
```sql
id              UUID  PRIMARY KEY
publication_id  UUID  REFERENCES publications(id) ON DELETE CASCADE
medecin_id      UUID  REFERENCES medecins(id)
type            ENUM('utile','insightful','accord','desaccord')
UNIQUE(publication_id, medecin_id)
```

### Table `otp_codes`
```sql
id          UUID  PRIMARY KEY
medecin_id  UUID  REFERENCES medecins(id) ON DELETE CASCADE
code        VARCHAR(6) NOT NULL
expires_at  TIMESTAMP NOT NULL
used        BOOLEAN DEFAULT FALSE
created_at  TIMESTAMP DEFAULT NOW()
```

### Table `notifications`
```sql
id              UUID  PRIMARY KEY
destinataire_id UUID  NOT NULL
type_dest       ENUM('medecin','admin')
type_notif      VARCHAR(100)   -- 'acces_patient_demande', 'compte_valide', 'nouveau_commentaire', ...
titre           VARCHAR(300)
message         TEXT
meta            JSONB DEFAULT '{}'   -- données supplémentaires (lien, id concerné)
lu              BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT NOW()
```

### Table `audit_logs`
```sql
id          UUID  PRIMARY KEY
medecin_id  UUID  REFERENCES medecins(id)
action      VARCHAR(200)      -- 'LOGIN', 'DIAGNOSTIC_IA', 'CONSULTATION_CREE', ...
details     JSONB DEFAULT '{}'
ip_address  INET
user_agent  VARCHAR(500)
created_at  TIMESTAMP DEFAULT NOW()
```

### Table `cas_cliniques_publics`  _(landing page)_
```sql
id              UUID  PRIMARY KEY
titre           VARCHAR(300)
pathologie      VARCHAR(200)
description     TEXT
tags            JSONB DEFAULT '[]'
pdf_url         VARCHAR(500)      -- téléchargeable publiquement
auteur_id       UUID  REFERENCES medecins(id) NULL
anonymise       BOOLEAN DEFAULT TRUE
nb_vues         INTEGER DEFAULT 0
nb_telechargements INTEGER DEFAULT 0
created_at      TIMESTAMP DEFAULT NOW()
```

---

## 🔌 Endpoints API

### Auth  `/api/v1/auth`
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/register` | Inscription médecin + upload documents (multipart/form-data) |
| POST | `/login` | Email + password → envoie OTP par email |
| POST | `/verify-otp` | Vérifie OTP → retourne JWT |
| POST | `/refresh` | Rafraîchit le token JWT |
| POST | `/logout` | Révoke le token |
| GET | `/me` | Profil de l'utilisateur connecté |

### Admin  `/api/v1/admin`
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/login` | Connexion admin (sans OTP) |
| GET | `/demandes` | Liste des inscriptions en attente |
| GET | `/demandes/{id}` | Détail d'une demande + documents |
| POST | `/demandes/{id}/valider` | Valider → envoi email au médecin |
| POST | `/demandes/{id}/rejeter` | Rejeter avec motif → envoi email |
| GET | `/medecins` | Liste de tous les médecins |
| PUT | `/medecins/{id}/suspendre` | Suspendre un compte |
| PUT | `/profil` | Modifier email / password / numéro SMS |
| GET | `/stats` | Stats globales plateforme |

### Patients  `/api/v1/patients`
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/` | Créer un patient |
| GET | `/` | Mes patients (créés par moi ou accès accordé) |
| GET | `/recherche?q=` | Chercher un patient par nom |
| GET | `/{id}` | Détail patient (si autorisé) |
| PUT | `/{id}` | Modifier un patient |
| POST | `/{id}/demande-acces` | Demander accès au médecin propriétaire |
| GET | `/acces/recues` | Demandes d'accès reçues sur mes patients |
| GET | `/acces/envoyees` | Demandes d'accès que j'ai envoyées |
| POST | `/acces/{id}/repondre` | Accepter / Refuser avec motif |

### Consultations  `/api/v1/consultations`
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/` | Créer une consultation (patient_id + symptômes) |
| GET | `/` | Mes consultations (filtrables : statut, date, pathologie) |
| GET | `/{id}` | Détail d'une consultation |
| PUT | `/{id}/avis` | Ajouter avis + prescriptions + recommandations |
| PUT | `/{id}/rdv` | Fixer prochain rendez-vous |
| POST | `/{id}/partager` | Partager vers communauté / public |
| GET | `/{id}/pdf` | Générer et télécharger le PDF bilan |

### Diagnostic IA  `/api/v1/diagnostics`
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/analyser` | Envoyer symptômes → réponse IA |
| GET | `/{consultation_id}` | Récupérer le diagnostic d'une consultation |
| POST | `/{id}/feedback` | Médecin donne son feedback sur la prédiction IA |
| GET | `/mes-stats` | Mes stats personnelles IA (concordance, top pathologies) |
| GET | `/monitoring` | Dashboard monitoring IA complet (médecin seulement) |

### Communautés  `/api/v1/communautes`
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/` | Créer une communauté |
| GET | `/` | Explorer les communautés (publiques + mes privées) |
| GET | `/{id}` | Détail d'une communauté |
| PUT | `/{id}` | Modifier (créateur/admin seulement) |
| DELETE | `/{id}` | Supprimer |
| POST | `/{id}/rejoindre` | Rejoindre (publique) / Demander (privée) |
| POST | `/{id}/inviter` | Inviter un médecin |
| DELETE | `/{id}/membres/{medecin_id}` | Exclure un membre |
| GET | `/{id}/membres` | Liste des membres |
| POST | `/{id}/publications` | Publier un cas / question / article |
| GET | `/{id}/publications` | Fil de la communauté |
| POST | `/publications/{id}/commenter` | Commenter |
| POST | `/publications/{id}/reagir` | Réagir (utile, insightful, etc.) |
| GET | `/mes-communautes` | Mes communautés |
| GET | `/fil` | Fil d'actualité agrégé de mes communautés |

### Notifications  `/api/v1/notifications`
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Mes notifications (paginées) |
| PUT | `/{id}/lire` | Marquer comme lue |
| PUT | `/lire-tout` | Tout marquer comme lu |

### Audit & Monitoring IA  `/api/v1/audit`  _(médecin uniquement)_
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/logs` | Mes logs d'activité (connexions, diagnostics, etc.) |
| GET | `/stats` | Résumé : nb diagnostics, nb patients, nb consultations |
| GET | `/ia-performance` | Concordance IA vs mes diagnostics finaux |
| GET | `/ia-historique` | Historique des prédictions avec résultats |

### Cas cliniques publics  `/api/v1/cas-cliniques`
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Liste des cas publiés (landing page) |
| GET | `/{id}` | Détail d'un cas |
| GET | `/{id}/telecharger` | Télécharger le PDF (incrément compteur) |
| POST | `/` | Publier un cas (médecin connecté seulement) |

---

## 💡 Fonctionnalités Communauté — Idées & Suggestions

### Rôles dans une communauté
- **Créateur** : gestion totale, peut nommer des admins
- **Admin** : modère, invite, exclut des membres
- **Membre** : publie, commente, réagit

### Types de publications
- 📋 **Cas clinique** — consultation anonymisée partagée pour avis collectif
- ❓ **Question** — soumettre un cas difficile pour consultation secondaire
- 📰 **Article** — guidelines, protocoles, études
- 💬 **Discussion** — débat clinique ouvert

### Fonctionnalités suggérées
- ⭐ **Vote de pertinence** — "Utile / Insightful / D'accord / Pas d'accord"
- 🔔 **Abonnement** — S'abonner à une publication pour suivre les réponses
- 🏆 **Classement mensuel** — Top contributeurs (nb cas partagés, nb réponses utiles)
- 📊 **Stats communauté** — Concordance IA moyenne du groupe, pathologies les plus discutées
- 🔒 **Communauté privée** — invitation uniquement, accès sur demande
- 🏷️ **Tags & filtres** — Tuberculose, BPCO, Asthme, etc.
- 📌 **Publications épinglées** — Cas importants mis en avant par l'admin
- 📁 **Bibliothèque** — Espace de dépôt de ressources (PDFs, guidelines)

---

## 🔐 Flux d'authentification

```
INSCRIPTION
Médecin remplit formulaire + upload 6 documents
     ↓
POST /auth/register (multipart/form-data)
     ↓
Compte créé avec statut = 'en_attente'
     ↓
Admin reçoit SMS : "Nouvelle demande de compte médecin"
     ↓
Admin se connecte → visualise documents
     ↓
  [Valide] → statut = 'valide' → email avec lien de connexion
  [Rejette] → statut = 'rejete' → email avec motif

CONNEXION
POST /auth/login (email + password)
     ↓
Vérification : email existe, password correct, statut = 'valide'
     ↓
Génération OTP 6 chiffres (exp. 5 min) → envoi email
     ↓
POST /auth/verify-otp
     ↓
JWT retourné → stocké côté client (localStorage / httpOnly cookie)
```

---

## 🤖 Flux Diagnostic IA

```
POST /diagnostics/analyser
Body: { consultation_id, symptomes: { toux: true, fievre: 2, dyspnee: "severe", ... } }
     ↓
preprocessor.py → encode symptômes en vecteur
     ↓
model.py → predict_proba() → top 3 maladies + %
     ↓
explainer.py → SHAP values → critères qui ont pesé dans le diagnostic
     ↓
Response: {
  maladies: [
    { nom: "Pneumonie bactérienne", pct: 87, criteres_valides: [...] },
    { nom: "Bronchite aiguë",       pct: 9  },
    { nom: "Tuberculose",           pct: 4  }
  ],
  etat_patient: "urgent",
  recommandations: ["Antibiothérapie immédiate", "Oxygénothérapie si SaO2 < 92%"]
}
     ↓
Résultat stocké dans diagnostics_ia
     ↓
Médecin valide / complète → feedback_ia (concordance booléenne + diagnostic final)
```

---

## ⚙️ Variables d'environnement (.env)

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/pneumoia
SECRET_KEY=your-secret-key-256-bits
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx
FROM_EMAIL=noreply@pneumoia.com

# SMS (Twilio ou Orange)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_FROM_NUMBER=+237xxxxxxxxx

# Stockage fichiers
UPLOAD_DIR=./uploads       # dev
AWS_S3_BUCKET=pneumoia-docs  # prod
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# Redis (cache OTP + Celery)
REDIS_URL=redis://localhost:6379/0

# IA
MODEL_PATH=./app/ml/artifacts/pneumoia_model.pkl
```

---

## 📦 requirements.txt principal

```
fastapi>=0.111.0
uvicorn[standard]>=0.29.0
sqlalchemy>=2.0.0
alembic>=1.13.0
asyncpg>=0.29.0           # driver PostgreSQL async
psycopg2-binary>=2.9.9    # driver sync (migrations Alembic)
pydantic>=2.7.0
pydantic-settings>=2.2.0
python-multipart>=0.0.9   # upload fichiers
python-jose[cryptography]>=3.3.0  # JWT
passlib[bcrypt]>=1.7.4    # hash passwords
pyotp>=2.9.0              # OTP
httpx>=0.27.0
celery[redis]>=5.3.0      # tâches asynchrones (emails, SMS)
redis>=5.0.0
boto3>=1.34.0             # S3 AWS
twilio>=9.0.0             # SMS
weasyprint>=62.0          # PDF
scikit-learn>=1.5.0       # modèle IA
joblib>=1.4.0             # sérialisation modèle
shap>=0.45.0              # explication IA
pandas>=2.2.0
numpy>=1.26.0
pillow>=10.0.0            # redimensionnement photos
python-dotenv>=1.0.0
```
