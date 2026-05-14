export const AUTOMATIONS = [

/* ── AIRTABLE ── */

{ id:"at-new-client-form", section:"Nouveau prospect", title:"Nouveau client → formulaire rempli", type:"Airtable", tag:"Formulaire", desc:"Après soumission du formulaire client, Airtable met à jour le statut du client en Nouveau prospect.", layout:"simple", steps:[
  ["📝","Formulaire envoyé","Le client soumet sa demande."],
  ["👤","Table Clients","Nouvelle entrée client créée."],
  ["🏷️","Statut client","Statut = Nouveau prospect."],
  ["✅","Prospect prêt","Le dossier peut passer au devis."]
]},

{ id:"at-prospect-to-quote", section:"Nouveau prospect", title:"Statut Nouveau prospect → devis à proposer", type:"Airtable", tag:"Devis", desc:"Lorsqu'un client devient Nouveau prospect, Airtable crée un devis associé au bon record client.", layout:"simple", steps:[
  ["🚦","Condition statut","Client = Nouveau prospect."],
  ["📄","Créer devis","Nouvelle entrée dans Devis."],
  ["🔗","Associer client","L'identifiant du client est automatiquement rattaché au devis."],
  ["🏷️","Statut devis","Statut = Devis à proposer."]
]},

{ id:"at-prospect-manager", section:"Nouveau prospect", title:"Nouveau prospect → Chargée d'affaires", type:"Airtable", tag:"Condition", desc:"Airtable recherche la chargée d'affaires, l'associe au devis et lui envoie une notification.", layout:"simple", steps:[
  ["📄","Devis créé","Entrée créée dans la table Devis."],
  ["🚦","Condition","Statut = Devis à proposer."],
  ["🔎","Recherche contact","Contact_Neobati : Emilie Poulain."],
  ["🔗","Associer suivi","Suivi_top_management mis à jour."],
  ["📧","Email interne","Notification envoyée."]
]},

{ id:"at-new-site-invoice", section:"Création Chantier / Facture", title:"New → Chantier / Facture", type:"Airtable", tag:"Chantier", desc:"Quand un devis est accepté, Airtable crée le chantier, la facture, les relie au client et déclenche les scénarios Make nécessaires.", layout:"simple", steps:[
  ["✅","Devis accepté","Statut = Devis accepté."],
  ["🏗️","Créer chantier","Statut_Chantier = Nouveau."],
  ["🔗","MAJ devis","Lien vers le chantier créé."],
  ["🧾","Créer facture","Statut = Nouvelle facture."],
  ["🔗","MAJ facture","Lien facture ↔ chantier."],
  ["📍","Webhook Maps","Déclenche Make géocodage."],
  ["👷","Webhook assignation","Déclenche Make assignation artisans."]
]},

{ id:"at-new-intervention", section:"Création Chantier / Facture", title:"Statut Nouvelle intervention", type:"Airtable", tag:"Intervention", desc:"À la création d'une intervention, Airtable initialise automatiquement son statut à Nouvelle.", layout:"simple", steps:[
  ["🛠️","Intervention créée","Nouvelle ligne Interventions."],
  ["🏷️","MAJ statut","Statut = Nouvelle."],
  ["✅","Intervention prête","Suivi terrain initialisé."]
]},

{ id:"at-detect-late-invoice", section:"Suivi facturation", title:"Détection → Retard facture", type:"Airtable", tag:"Retard", desc:"Airtable détecte une facture en retard (⚠️), met à jour l'état et déclenche Make pour la Relance 1.", layout:"simple", steps:[
  ["⏰","Échéance dépassée","Date_Echeance < aujourd'hui."],
  ["🚦","Conditions paiement","En attente + Facture envoyée + ⚠️."],
  ["🏷️","État paiement","Etat_paiement = En retard. Statut = Relance 1 envoyée."],
  ["📤","Webhook Make","Déclenche Relance facture 1."]
]},

{ id:"at-detect-relance2", section:"Suivi facturation", title:"Détection → Relance 2", type:"Airtable", tag:"Relance", desc:"Airtable détecte qu'une semaine s'est écoulée depuis la Relance 1 et déclenche Make pour la Relance 2.", layout:"simple", steps:[
  ["⏰","Relance 1 + 1 sem.","Champ Relance1+1semaine = 1."],
  ["🚦","Conditions","En retard + Relance 1 envoyée + ⚠️."],
  ["🏷️","MAJ statut","Statut = Relance 2 envoyée."],
  ["📤","Webhook Make","Déclenche Relance facture 2."]
]},

{ id:"at-invoice-sent-pending", section:"Suivi facturation", title:"Facture envoyée → paiement en attente", type:"Airtable", tag:"Paiement", desc:"Quand une facture passe au statut Facture envoyée, Airtable met l'état de paiement en attente.", layout:"simple", steps:[
  ["📧","Facture envoyée","Statut = Facture envoyée."],
  ["🏷️","État paiement","Etat_paiement = En attente."],
  ["✅","Suivi activé","La facture peut être surveillée."]
]},

{ id:"at-paid-invoice", section:"Suivi facturation", title:"Paiement soldé → facture payée", type:"Airtable", tag:"Paiement", desc:"Si la vérification des montants est validée (✅), Airtable marque la facture comme payée et procède à la désassignation des personnes suivant la facture.", layout:"simple", steps:[
  ["✅","Montant validé","Verification_montant contient ✅."],
  ["🏷️","MAJ facture","Etat_paiement = Payé."],
  ["🎯","Suivi_facture vidé","Champ Suivi_facture mis à vide."]
]},

{ id:"at-artisan-unavailable", section:"Artisan", title:"Artisan → indisponible / en mission", type:"Airtable", tag:"Webhook", desc:"Quand le statut d'un artisan devient Indisponible ou En mission, Airtable déclenche le scénario Make de réassignation automatique.", layout:"simple", steps:[
  ["👷","Statut artisan","Indisponible ou En mission."],
  ["🚦","Condition Airtable","Statut métier détecté."],
  ["📤","Webhook Make","Déclenche Réassignation automatique."]
]},

{ id:"at-site-finished-invoice", section:"Avancement chantier", title:"Chantier terminé → envoi facture client", type:"Airtable", tag:"Facture", desc:"Quand un chantier passe au statut Terminé, Airtable déclenche le scénario Make d'envoi de facture client.", layout:"simple", steps:[
  ["🏗️","Chantier terminé","Statut = Terminé."],
  ["📤","Webhook Make","Déclenche Envoi facture client."],
  ["🧾","Facturation lancée","La facture peut être envoyée."]
]},

{ id:"at-site-100", section:"Avancement chantier", title:"MAJ chantier → 100 % terminé", type:"Airtable", tag:"Avancement", desc:"Lorsque l'avancement chantier atteint 100 %, Airtable termine le chantier, clôt les interventions, archive le devis et libère les artisans.", layout:"simple", steps:[
  ["📊","Avancement 100 %","Avancement_Chantier = 100 %."],
  ["🔎","Recherche artisans","Artisans avec Statut = En mission."],
  ["🏷️","MAJ chantier","Statut_Chantier = Terminé. Artisans_assignes vidé."],
  ["🔎","Recherche interventions","Interventions avec Statut = En cours."],
  ["🏷️","Clôture intervention","Statut intervention = Terminée."],
  ["🔎","Recherche devis","Devis avec Statut = Devis accepté."],
  ["🏷️","Archive devis","Statut = Devis archivé. Suivi_top_management vidé."],
  ["🔁","Répéter records","Pour chaque artisan trouvé."],
  ["👷","Libérer artisan","Statut artisan = Disponible."]
]},

{ id:"at-update-intervention-progress", section:"Avancement chantier", title:"MAJ avancement intervention", type:"Airtable", tag:"Rapport", desc:"Quand l'avancement d'une intervention change (vue Tableur Interventions), Airtable déclenche Make pour générer le rapport.", layout:"simple", steps:[
  ["🛠️","Intervention modifiée","Champ Avancement_Intervention."],
  ["👁️","Vue Interventions","Lorsque l'avancement est mis à jour."],
  ["📤","Webhook Make","Déclenche Génération de rapport."]
]},

{ id:"at-low-stock", section:"Gestion stock", title:"Alerte → stock faible", type:"Airtable", tag:"Stock", desc:"Airtable détecte un stock restant inférieur à 20 unités et met à jour le statut du matériau.", layout:"simple", steps:[
  ["📦","Stock restant","Stock_restant < 20."],
  ["🚦","Condition statut","Statut matériau = Disponible."],
  ["🏷️","MAJ matériau","Statut = Stock faible."]
]},

{ id:"at-supplier-order", section:"Gestion stock", title:"Commande fournisseur", type:"Airtable", tag:"Fournisseur", desc:"Lorsqu'un matériau est en stock faible, Airtable le passe en commande, recherche le fournisseur lié et envoie un email.", layout:"simple", steps:[
  ["📦","Stock faible","Statut matériau = Stock faible."],
  ["🏷️","MAJ matériau","Statut = En commande."],
  ["🔎","Recherche fournisseur","Fournisseur lié au Materiaux_ID."],
  ["📧","Email fournisseur","Demande de commande envoyée."]
]},

/* ── MAKE ── */

{ id:"mk-maps", section:"Make", title:"Intégration Maps à partir d'une adresse", type:"Make", tag:"Google Maps", desc:"Make récupère les informations du chantier et du client, convertit l'adresse en coordonnées GPS via Google Maps, puis met à jour l'URL dans Airtable.", layout:"simple", steps:[
  ["⚡","Webhook Airtable","Nouveau chantier/facture → chantier_record_id."],
  ["🏗️","Info chantier","Lecture record Airtable (Adresse_chantier, GPS…)."],
  ["📍","Google Maps","Adresse → géocode + URL Google Maps."],
  ["🗂️","MAJ Airtable","Champs GPS et localisation mis à jour."]
]},

{ id:"mk-assign", section:"Make", title:"Assignation des artisans → Nouveau chantier", type:"Make", tag:"Router", desc:"Make récupère les informations du chantier et du client, itère sur les types de travaux, appelle le script d'assignation Google, puis route selon disponibilité : agrégation + SMS coordinatrice.", layout:"router",
  preSteps:[
    ["⚡","Webhook Airtable","Nouveau chantier détecté."],
    ["🏗️","Info chantier","Lecture dossier chantier (Type_Travaux, Secteur…)."],
    ["👤","Info client","Adresse et contexte client."],
    ["🔁","Itération travaux","Boucle sur les types de travaux."],
    ["🧠","Script assignation","Appel HTTP → recherche artisans disponibles."]
  ],
  router:["🔀","Router résultat","Assignation possible ?"],
  branches:{
    ok:{ caption:"Cas A · Assignation OK", label:"Cas A · Assignation OK", steps:[
      ["🧩","Agrégation artisans","Liste artisans retenus regroupée."],
      ["📲","SMS coordinatrice","Notification Twilio envoyée."]
    ]},
    ko:{ caption:"Cas B · Assignation KO", label:"Cas B · Assignation KO", steps:[
      ["⚠️","Alerte assignation","Aucun résultat fiable."],
      ["📲","SMS coordinatrice","Contrôle manuel demandé via Twilio."]
    ]}
  }
},

{ id:"mk-reassign", section:"Make", title:"Réassignation automatique", type:"Make", tag:"Router", desc:"Quand un artisan devient indisponible, Make appelle le script de réassignation puis route : SMS de confirmation ou alerte manuelle.", layout:"router",
  preSteps:[
    ["⚡","Webhook Airtable","Artisan indisponible / en mission."],
    ["🧠","Script réassignation","Appel HTTP → recherche artisan disponible."]
  ],
  router:["🔀","Router","Remplacement trouvé ?"],
  branches:{
    ok:{ caption:"Cas A · Assignation OK", label:"Cas A · Assignation OK", steps:[
      ["✅","Réassigner chantier","Nouvel artisan affecté."],
      ["📲","SMS coordinatrice","Notification Twilio envoyée."]
    ]},
    ko:{ caption:"Cas B · Assignation KO", label:"Cas B · Assignation KO", steps:[
      ["⚠️","Alerter suivi","Traitement manuel requis."],
      ["📲","SMS coordinatrice","Alerte Twilio envoyée."]
    ]}
  }
},

{ id:"mk-progress", section:"Make", title:"Formulaire artisan — Avancement", type:"Make", tag:"Fillout", desc:"L'artisan soumet son avancement via Fillout (avancement %, photo, commentaires) ; Make met à jour les champs de l'intervention dans Airtable.", layout:"simple", steps:[
  ["📱","Formulaire Fillout","Trigger : nouvelle soumission artisan."],
  ["🗂️","MAJ intervention","Avancement %, photo, commentaires, URL Fillout."],
  ["✅","Airtable à jour","Données prêtes pour la génération de rapport."]
]},

{ id:"mk-report", section:"Make", title:"Génération de rapport", type:"Make", tag:"PDF", desc:"Make enrichit un HTML par les données intervention, chantier, client, artisan, avancement en % et génère le rapport PDF via PDF.co et l'envoie par email au chef de chantier.", layout:"simple", steps:[
  ["⚡","Webhook avancement","Intervention mise à jour (Airtable)."],
  ["🛠️","Info intervention","Avancement %, photo, commentaires, Artisan_intervenant."],
  ["🏗️","Info chantier","Contexte chantier."],
  ["👤","Info client","Coordonnées et contexte client."],
  ["👷","Info artisan","Nom, prénom, secteur, statut artisan."],
  ["📊","Conversion %","Avancement_chantier_global en %."],
  ["📄","PDF.co","Génération rapport HTML → PDF."],
  ["📧","Email chef chantier","Rapport PDF envoyé via Google Email."]
]},

{ id:"mk-invoice", section:"Make", title:"Envoi facture client", type:"Make", tag:"Facturation", desc:"Quand le chantier est terminé (100 %), Make récupère chantier, facture et client, formate les dates, génère la facture PDF, rédige l'email via IA puis envoie et met à jour Airtable.", layout:"simple", steps:[
  ["⚡","Webhook chantier","Chantier 100 % terminé (Airtable)."],
  ["🏗️","Infos chantier","Données chantier (prix, type travaux, dates)."],
  ["🧾","Infos facture","Montants HT, TVA, TTC, dates échéance/émission."],
  ["👤","Infos client","Email et coordonnées client."],
  ["📅","Formatage dates","util:SetVariables → Date_Echeance, Date_Emission."],
  ["📄","Facture PDF","pdf-co:HTMLtoPDF → Facture_{{ID}}_neobati.pdf."],
  ["🤖","Génération email IA","openai-gpt-3 → email personnalisé."],
  ["📧","Envoi email","Client + CC directeur via Google Email."],
  ["🗂️","MAJ facture","Statut facture mis à jour dans Airtable."]
]},

{ id:"mk-reminder", section:"Make", title:"Relance facture 1", type:"Make", tag:"Relance", desc:"En cas de retard de paiement, Make récupère facture et chantier, génère un email par IA, l'envoie, et met à jour la date de relance 1 dans Airtable.", layout:"simple", steps:[
  ["⚡","Webhook retard","Facture en retard — Relance 1 (Airtable)."],
  ["🧾","Infos facture","Montants, dates échéance/émission."],
  ["🏗️","Infos chantier","Contexte du dossier."],
  ["🤖","Génération email IA","Relance personnalisée par IA."],
  ["📧","Envoi email","Client + CC directeur via Google Email."],
  ["🗂️","MAJ date relance 1","Date_relance_1 mise à jour dans Airtable."]
]},

{ id:"mk-reminder2", section:"Make", title:"Relance facture 2", type:"Make", tag:"Relance", desc:"Une semaine après la Relance 1, Make génère un email par IA, l'envoie et met à jour la date de relance 2 dans Airtable.", layout:"simple", steps:[
  ["⚡","Webhook relance 2","Relance 2 déclenchée (Airtable)."],
  ["🧾","Infos facture","Montants, dates, état de paiement."],
  ["🏗️","Infos chantier","Contexte du dossier."],
  ["🤖","Génération email IA","Relance personnalisée par IA."],
  ["📧","Envoi email","Client + CC directeur via Google Email."],
  ["🗂️","MAJ date relance 2","Date_relance_2 mise à jour dans Airtable."]
]}

]
