import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../public/locales');

const heroTranslations = {
  en: {
    badge: "KYC & AML Solutions for European Financial Services",
    platformTitle: "Enterprise Compliance Platform",
    platformDescription: "Comprehensive KYC verification, AML monitoring, and regulatory reporting in one powerful platform",
    screenshots: {
      transactionMonitoring: {
        title: "Intelligent Transaction Monitoring",
        description: "Advanced detection rules monitoring thresholds, velocity patterns, and structuring behavior. Catch suspicious activity before it becomes a compliance issue with AI-powered analysis."
      },
      riskAssessment: {
        title: "Smart Risk Assessment & Classification",
        description: "Automated risk profiling with dynamic scoring across multiple dimensions. Classify customers instantly and adjust monitoring intensity based on real-time risk indicators."
      },
      beneficialOwnership: {
        title: "Beneficial Ownership Intelligence",
        description: "Comprehensive UBO tracking for individuals and corporate structures. Visualize complex ownership chains and automatically identify control persons across multi-tier entities."
      },
      customerDueDiligence: {
        title: "Customer Due Diligence with Smart Profiling",
        description: "Streamlined CDD processes with intelligent risk profiling. Gather the right information at the right time while maintaining exceptional customer experience and regulatory compliance."
      },
      sanctionsScreening: {
        title: "Sanctions & PEP Screening",
        description: "Real-time screening against 200+ global sanctions lists, PEP databases, and adverse media sources. Get instant alerts on matches with intelligent fuzzy matching to reduce false positives."
      },
      recordKeeping: {
        title: "AI-Powered Record Keeping & Verification",
        description: "Intelligent document management with automated verification and tamper detection. Smart AI validates authenticity, extracts data, and maintains comprehensive audit trails for all compliance records."
      }
    }
  },
  sv: {
    badge: "KYC & AML Lösningar för Europeiska Finansiella Tjänster",
    platformTitle: "Enterprise Compliance-plattform",
    platformDescription: "Omfattande KYC-verifiering, AML-övervakning och regulatorisk rapportering i en kraftfull plattform",
    screenshots: {
      transactionMonitoring: {
        title: "Intelligent Transaktionsövervakning",
        description: "Avancerade detektionsregler övervakar trösklar, hastighetsmönster och struktureringsbeteende. Fånga misstänkt aktivitet innan det blir ett efterlevnadsproblem med AI-driven analys."
      },
      riskAssessment: {
        title: "Smart Riskbedömning & Klassificering",
        description: "Automatiserad riskprofilering med dynamisk poängsättning över flera dimensioner. Klassificera kunder omedelbart och justera övervakningsintensitet baserat på realtidsriskindikatorer."
      },
      beneficialOwnership: {
        title: "Verkliga Ägare Intelligence",
        description: "Omfattande UBO-spårning för individer och företagsstrukturer. Visualisera komplexa ägarkedjor och identifiera automatiskt kontrollpersoner över flerlagsentiteter."
      },
      customerDueDiligence: {
        title: "Customer Due Diligence med Smart Profilering",
        description: "Strömlinjeformade CDD-processer med intelligent riskprofilering. Samla rätt information vid rätt tidpunkt samtidigt som du upprätthåller exceptionell kundupplevelse och regelefterlevnad."
      },
      sanctionsScreening: {
        title: "Sanktions- & PEP-screening",
        description: "Realtidsscreening mot 200+ globala sanktionslistor, PEP-databaser och negativa mediekällor. Få omedelbara varningar om matchningar med intelligent fuzzy matching för att minska falska positiver."
      },
      recordKeeping: {
        title: "AI-driven Journalföring & Verifiering",
        description: "Intelligent dokumenthantering med automatiserad verifiering och manipulationsdetektering. Smart AI validerar äkthet, extraherar data och upprätthåller omfattande revisionsspår för alla efterlevnadsposter."
      }
    }
  },
  no: {
    badge: "KYC & AML Løsninger for Europeiske Finansielle Tjenester",
    platformTitle: "Enterprise Compliance-plattform",
    platformDescription: "Omfattende KYC-verifisering, AML-overvåking og regulatorisk rapportering i én kraftig plattform",
    screenshots: {
      transactionMonitoring: {
        title: "Intelligent Transaksjonsovervåking",
        description: "Avanserte deteksjonsregler overvåker terskler, hastighetsmønstre og struktureringsadferd. Fang mistenkelig aktivitet før det blir et compliance-problem med AI-drevet analyse."
      },
      riskAssessment: {
        title: "Smart Risikovurdering & Klassifisering",
        description: "Automatisert risikoprofilering med dynamisk scoring på tvers av flere dimensjoner. Klassifiser kunder øyeblikkelig og juster overvåkingsintensitet basert på sanntidsrisikoindikatorer."
      },
      beneficialOwnership: {
        title: "Reelle Eiere Intelligence",
        description: "Omfattende UBO-sporing for enkeltpersoner og selskapsstrukturer. Visualiser komplekse eierskapskjeder og identifiser automatisk kontrollpersoner på tvers av flerlagsenheter."
      },
      customerDueDiligence: {
        title: "Customer Due Diligence med Smart Profilering",
        description: "Strømlinjeformede CDD-prosesser med intelligent risikoprofilering. Samle riktig informasjon til riktig tid samtidig som du opprettholder eksepsjonell kundeopplevelse og regulatorisk overholdelse."
      },
      sanctionsScreening: {
        title: "Sanksjons- & PEP-screening",
        description: "Sanntidsscreening mot 200+ globale sanksjonslister, PEP-databaser og negative mediekilder. Få øyeblikkelige varsler om treff med intelligent fuzzy matching for å redusere falske positiver."
      },
      recordKeeping: {
        title: "AI-drevet Journalføring & Verifisering",
        description: "Intelligent dokumenthåndtering med automatisert verifisering og manipulasjonsdeteksjon. Smart AI validerer autentisitet, ekstraherer data og opprettholder omfattende revisjonsspor for alle compliance-poster."
      }
    }
  },
  fi: {
    badge: "KYC & AML Ratkaisut Eurooppalaisille Rahoituspalveluille",
    platformTitle: "Enterprise Compliance-alusta",
    platformDescription: "Kattava KYC-vahvistus, AML-seuranta ja sääntelyyn liittyvä raportointi yhdessä tehokkaassa alustassa",
    screenshots: {
      transactionMonitoring: {
        title: "Älykäs Transaktioiden Seuranta",
        description: "Edistyneet tunnistussäännöt seuraavat kynnysarvoja, nopeusmalleja ja rakenteellista käyttäytymistä. Tunnista epäilyttävä toiminta ennen kuin siitä tulee compliance-ongelma AI-pohjaisella analyysillä."
      },
      riskAssessment: {
        title: "Älykäs Riskiarviointi & Luokittelu",
        description: "Automatisoitu riskiprofilointi dynaamisella pisteyttämisellä useissa ulottuvuuksissa. Luokittele asiakkaat välittömästi ja säädä seurannan intensiteettiä reaaliaikaisten riskinäytteiden perusteella."
      },
      beneficialOwnership: {
        title: "Tosiasiallisten Omistajien Älykkyys",
        description: "Kattava UBO-seuranta yksityishenkilöille ja yritysrakenteille. Visualisoi monimutkaiset omistusketjut ja tunnista automaattisesti määräysvaltahenkilöt monitasoisten yksiköiden välillä."
      },
      customerDueDiligence: {
        title: "Customer Due Diligence Älykäällä Profiloinnilla",
        description: "Virtaviivaistetut CDD-prosessit älykkäällä riskiprofiloinnilla. Kerää oikeat tiedot oikeaan aikaan säilyttäen samalla poikkeuksellisen asiakaskokemuksen ja säännösten noudattamisen."
      },
      sanctionsScreening: {
        title: "Pakotteet & PEP-seulonta",
        description: "Reaaliaikainen seulonta yli 200 maailmanlaajuista pakotelistaa, PEP-tietokantoja ja negatiivisia medialähteitä vastaan. Saa välittömiä hälytyksiä osumista älykkäällä fuzzy matchingilla vähentääksesi vääriä positiivisia."
      },
      recordKeeping: {
        title: "AI-pohjainen Kirjanpito & Vahvistus",
        description: "Älykäs asiakirjahallinta automatisoituna vahvistuksena ja manipuloinnin havaitsemisena. Älykäs AI validoi aitouden, poimii tiedot ja ylläpitää kattavia tarkastusjälkiä kaikista compliance-tietueista."
      }
    }
  },
  de: {
    badge: "KYC & AML Lösungen für Europäische Finanzdienstleistungen",
    platformTitle: "Enterprise Compliance-Plattform",
    platformDescription: "Umfassende KYC-Verifizierung, AML-Überwachung und regulatorische Berichterstattung in einer leistungsstarken Plattform",
    screenshots: {
      transactionMonitoring: {
        title: "Intelligente Transaktionsüberwachung",
        description: "Erweiterte Erkennungsregeln überwachen Schwellenwerte, Geschwindigkeitsmuster und Strukturierungsverhalten. Erfassen Sie verdächtige Aktivitäten, bevor sie zu einem Compliance-Problem werden, mit KI-gestützter Analyse."
      },
      riskAssessment: {
        title: "Intelligente Risikobewertung & Klassifizierung",
        description: "Automatisierte Risikoprofilierung mit dynamischer Bewertung über mehrere Dimensionen. Klassifizieren Sie Kunden sofort und passen Sie die Überwachungsintensität basierend auf Echtzeit-Risikoindikatoren an."
      },
      beneficialOwnership: {
        title: "Wirtschaftliche Eigentümer Intelligence",
        description: "Umfassendes UBO-Tracking für Einzelpersonen und Unternehmensstrukturen. Visualisieren Sie komplexe Eigentumsketten und identifizieren Sie automatisch Kontrollpersonen über mehrschichtige Einheiten hinweg."
      },
      customerDueDiligence: {
        title: "Customer Due Diligence mit Intelligenter Profilierung",
        description: "Optimierte CDD-Prozesse mit intelligenter Risikoprofilierung. Sammeln Sie die richtigen Informationen zur richtigen Zeit und bewahren Sie dabei außergewöhnliche Kundenerfahrung und regulatorische Compliance."
      },
      sanctionsScreening: {
        title: "Sanktions- & PEP-Screening",
        description: "Echtzeit-Screening gegen über 200 globale Sanktionslisten, PEP-Datenbanken und negative Medienquellen. Erhalten Sie sofortige Warnungen bei Übereinstimmungen mit intelligentem Fuzzy Matching zur Reduzierung falsch-positiver Ergebnisse."
      },
      recordKeeping: {
        title: "KI-gestützte Aufzeichnung & Verifizierung",
        description: "Intelligente Dokumentenverwaltung mit automatisierter Verifizierung und Manipulationserkennung. Intelligente KI validiert Authentizität, extrahiert Daten und führt umfassende Audit-Trails für alle Compliance-Aufzeichnungen."
      }
    }
  },
  fr: {
    badge: "Solutions KYC & AML pour Services Financiers Européens",
    platformTitle: "Plateforme Enterprise de Conformité",
    platformDescription: "Vérification KYC complète, surveillance AML et reporting réglementaire dans une plateforme puissante",
    screenshots: {
      transactionMonitoring: {
        title: "Surveillance Intelligente des Transactions",
        description: "Règles de détection avancées surveillant les seuils, les modèles de vélocité et le comportement de structuration. Détectez l'activité suspecte avant qu'elle ne devienne un problème de conformité grâce à l'analyse alimentée par l'IA."
      },
      riskAssessment: {
        title: "Évaluation & Classification Intelligente des Risques",
        description: "Profilage des risques automatisé avec notation dynamique sur plusieurs dimensions. Classifiez les clients instantanément et ajustez l'intensité de surveillance en fonction des indicateurs de risque en temps réel."
      },
      beneficialOwnership: {
        title: "Intelligence sur les Bénéficiaires Effectifs",
        description: "Suivi UBO complet pour les individus et les structures d'entreprise. Visualisez les chaînes de propriété complexes et identifiez automatiquement les personnes de contrôle à travers les entités multi-niveaux."
      },
      customerDueDiligence: {
        title: "Diligence Client avec Profilage Intelligent",
        description: "Processus CDD rationalisés avec profilage des risques intelligent. Collectez les bonnes informations au bon moment tout en maintenant une expérience client exceptionnelle et la conformité réglementaire."
      },
      sanctionsScreening: {
        title: "Screening Sanctions & PEP",
        description: "Screening en temps réel contre plus de 200 listes de sanctions mondiales, bases de données PEP et sources médiatiques négatives. Recevez des alertes instantanées sur les correspondances avec une correspondance floue intelligente pour réduire les faux positifs."
      },
      recordKeeping: {
        title: "Tenue de Registres & Vérification Alimentée par l'IA",
        description: "Gestion intelligente des documents avec vérification automatisée et détection de falsification. L'IA intelligente valide l'authenticité, extrait les données et maintient des pistes d'audit complètes pour tous les enregistrements de conformité."
      }
    }
  },
  es: {
    badge: "Soluciones KYC & AML para Servicios Financieros Europeos",
    platformTitle: "Plataforma Enterprise de Cumplimiento",
    platformDescription: "Verificación KYC integral, monitoreo AML y reportes regulatorios en una plataforma potente",
    screenshots: {
      transactionMonitoring: {
        title: "Monitoreo Inteligente de Transacciones",
        description: "Reglas de detección avanzadas que monitorean umbrales, patrones de velocidad y comportamiento de estructuración. Detecte actividad sospechosa antes de que se convierta en un problema de cumplimiento con análisis impulsado por IA."
      },
      riskAssessment: {
        title: "Evaluación & Clasificación Inteligente de Riesgos",
        description: "Perfilado de riesgos automatizado con puntuación dinámica en múltiples dimensiones. Clasifique clientes instantáneamente y ajuste la intensidad del monitoreo basándose en indicadores de riesgo en tiempo real."
      },
      beneficialOwnership: {
        title: "Inteligencia de Beneficiarios Finales",
        description: "Seguimiento UBO integral para individuos y estructuras corporativas. Visualice cadenas de propiedad complejas e identifique automáticamente personas de control a través de entidades multinivel."
      },
      customerDueDiligence: {
        title: "Debida Diligencia del Cliente con Perfilado Inteligente",
        description: "Procesos CDD optimizados con perfilado de riesgos inteligente. Recopile la información correcta en el momento correcto mientras mantiene una experiencia excepcional del cliente y cumplimiento regulatorio."
      },
      sanctionsScreening: {
        title: "Screening de Sanciones & PEP",
        description: "Screening en tiempo real contra más de 200 listas de sanciones globales, bases de datos PEP y fuentes de medios adversos. Obtenga alertas instantáneas sobre coincidencias con coincidencia difusa inteligente para reducir falsos positivos."
      },
      recordKeeping: {
        title: "Mantenimiento de Registros & Verificación Impulsado por IA",
        description: "Gestión inteligente de documentos con verificación automatizada y detección de manipulación. La IA inteligente valida la autenticidad, extrae datos y mantiene pistas de auditoría completas para todos los registros de cumplimiento."
      }
    }
  },
  it: {
    badge: "Soluzioni KYC & AML per Servizi Finanziari Europei",
    platformTitle: "Piattaforma Enterprise di Conformità",
    platformDescription: "Verifica KYC completa, monitoraggio AML e reporting normativo in un'unica potente piattaforma",
    screenshots: {
      transactionMonitoring: {
        title: "Monitoraggio Intelligente delle Transazioni",
        description: "Regole di rilevamento avanzate che monitorano soglie, pattern di velocità e comportamento di strutturazione. Rileva attività sospette prima che diventino un problema di conformità con analisi alimentata dall'IA."
      },
      riskAssessment: {
        title: "Valutazione & Classificazione Intelligente del Rischio",
        description: "Profilazione del rischio automatizzata con punteggio dinamico su più dimensioni. Classifica i clienti istantaneamente e regola l'intensità del monitoraggio in base agli indicatori di rischio in tempo reale."
      },
      beneficialOwnership: {
        title: "Intelligence sui Beneficiari Effettivi",
        description: "Tracciamento UBO completo per individui e strutture aziendali. Visualizza catene di proprietà complesse e identifica automaticamente le persone di controllo attraverso entità multi-livello."
      },
      customerDueDiligence: {
        title: "Due Diligence del Cliente con Profilazione Intelligente",
        description: "Processi CDD semplificati con profilazione del rischio intelligente. Raccogli le informazioni giuste al momento giusto mantenendo un'esperienza cliente eccezionale e conformità normativa."
      },
      sanctionsScreening: {
        title: "Screening Sanzioni & PEP",
        description: "Screening in tempo reale contro oltre 200 liste di sanzioni globali, database PEP e fonti mediatiche avverse. Ricevi avvisi istantanei su corrispondenze con matching fuzzy intelligente per ridurre i falsi positivi."
      },
      recordKeeping: {
        title: "Tenuta Registri & Verifica Alimentata dall'IA",
        description: "Gestione intelligente dei documenti con verifica automatizzata e rilevamento delle manomissioni. L'IA intelligente convalida l'autenticità, estrae i dati e mantiene tracce di audit complete per tutti i record di conformità."
      }
    }
  },
  nl: {
    badge: "KYC & AML Oplossingen voor Europese Financiële Diensten",
    platformTitle: "Enterprise Compliance Platform",
    platformDescription: "Uitgebreide KYC-verificatie, AML-monitoring en regelgevende rapportage in één krachtig platform",
    screenshots: {
      transactionMonitoring: {
        title: "Intelligente Transactiemonitoring",
        description: "Geavanceerde detectieregels monitoren drempels, snelheidspatronen en structureringsgedrag. Vang verdachte activiteit voordat het een nalevingsprobleem wordt met AI-aangedreven analyse."
      },
      riskAssessment: {
        title: "Slimme Risicobeoordeling & Classificatie",
        description: "Geautomatiseerde risicoprofilering met dynamische scoring over meerdere dimensies. Classificeer klanten onmiddellijk en pas monitoringintensiteit aan op basis van real-time risico-indicatoren."
      },
      beneficialOwnership: {
        title: "Uiteindelijk Begunstigde Intelligence",
        description: "Uitgebreide UBO-tracking voor individuen en bedrijfsstructuren. Visualiseer complexe eigendomsketens en identificeer automatisch controlerende personen over meerlaagse entiteiten."
      },
      customerDueDiligence: {
        title: "Klant Due Diligence met Slimme Profilering",
        description: "Gestroomlijnde CDD-processen met intelligente risicoprofilering. Verzamel de juiste informatie op het juiste moment terwijl u uitzonderlijke klantervaring en regelgevende naleving behoudt."
      },
      sanctionsScreening: {
        title: "Sancties & PEP Screening",
        description: "Real-time screening tegen 200+ wereldwijde sanctielijsten, PEP-databases en negatieve mediabronnen. Ontvang directe waarschuwingen over matches met intelligente fuzzy matching om valse positieven te verminderen."
      },
      recordKeeping: {
        title: "AI-aangedreven Recordkeeping & Verificatie",
        description: "Intelligente documentbeheer met geautomatiseerde verificatie en manipulatiedetectie. Slimme AI valideert authenticiteit, extraheert gegevens en onderhoudt uitgebreide audittrails voor alle nalevingsrecords."
      }
    }
  },
  pt: {
    badge: "Soluções KYC & AML para Serviços Financeiros Europeus",
    platformTitle: "Plataforma Enterprise de Conformidade",
    platformDescription: "Verificação KYC abrangente, monitoramento AML e relatórios regulatórios em uma plataforma poderosa",
    screenshots: {
      transactionMonitoring: {
        title: "Monitoramento Inteligente de Transações",
        description: "Regras de detecção avançadas monitoram limites, padrões de velocidade e comportamento de estruturação. Detecte atividade suspeita antes que se torne um problema de conformidade com análise alimentada por IA."
      },
      riskAssessment: {
        title: "Avaliação & Classificação Inteligente de Risco",
        description: "Perfil de risco automatizado com pontuação dinâmica em múltiplas dimensões. Classifique clientes instantaneamente e ajuste a intensidade do monitoramento com base em indicadores de risco em tempo real."
      },
      beneficialOwnership: {
        title: "Inteligência de Beneficiários Efetivos",
        description: "Rastreamento UBO abrangente para indivíduos e estruturas corporativas. Visualize cadeias de propriedade complexas e identifique automaticamente pessoas de controle através de entidades multinível."
      },
      customerDueDiligence: {
        title: "Due Diligence do Cliente com Perfil Inteligente",
        description: "Processos CDD simplificados com perfil de risco inteligente. Colete as informações certas no momento certo mantendo experiência excepcional do cliente e conformidade regulatória."
      },
      sanctionsScreening: {
        title: "Screening de Sanções & PEP",
        description: "Screening em tempo real contra mais de 200 listas de sanções globais, bancos de dados PEP e fontes de mídia adversas. Receba alertas instantâneos sobre correspondências com correspondência difusa inteligente para reduzir falsos positivos."
      },
      recordKeeping: {
        title: "Manutenção de Registros & Verificação Alimentada por IA",
        description: "Gestão inteligente de documentos com verificação automatizada e detecção de adulteração. IA inteligente valida autenticidade, extrai dados e mantém trilhas de auditoria abrangentes para todos os registros de conformidade."
      }
    }
  }
};

// Update each language's hero.json file
for (const [lang, translations] of Object.entries(heroTranslations)) {
  const filePath = path.join(localesDir, lang, 'hero.json');

  // Read existing file
  const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Merge with new translations
  const updated = {
    ...existing,
    badge: translations.badge,
    platformTitle: translations.platformTitle,
    platformDescription: translations.platformDescription,
    screenshots: translations.screenshots
  };

  // Write back
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n');
  console.log(`✅ Updated ${lang}/hero.json with screenshot translations`);
}

console.log('\n✨ All hero translations updated successfully!');
