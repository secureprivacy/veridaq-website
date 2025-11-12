import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../public/locales');

// Features translations for all languages
const featuresTranslations = {
  en: {
    badge: "Complete KYC/AML Platform",
    title: "The Complete Compliance Arsenal",
    subtitle: "Everything from instant customer verification to AI-powered transaction monitoring to one-click regulatory reporting. The only platform that covers every EU AMLR requirement without compromise.",
    platformFeatures: {
      kycVerification: {
        title: "Instant Customer Verification",
        description: "Verify any customer in under 60 seconds with intelligent eID routing across MitID, BankID, and Freja. Automated risk scoring happens in real-time, so you know exactly who you're dealing with before approval.",
        features: [
          "Smart eID orchestration across all EU identity systems",
          "AI-powered document authenticity verification",
          "Live register lookups with 15+ EU business authorities",
          "Instant beneficial ownership mapping",
          "Complete onboarding in 60 seconds or less"
        ]
      },
      transactionMonitoring: {
        title: "24/7 Transaction Intelligence",
        description: "AI that never sleeps, monitoring every transaction for suspicious patterns, structuring attempts, and velocity anomalies. Catch threats before they become compliance nightmares.",
        features: [
          "Real-time monitoring of 100% of transactions",
          "Behavioral analysis detecting pattern deviations",
          "Machine learning trained on 10M+ EU transactions",
          "Dynamic risk scoring that adapts to customer behavior",
          "Instant alerts to your team when thresholds breach"
        ]
      },
      complianceReporting: {
        title: "Zero-Touch Reporting",
        description: "Generate audit-ready regulatory reports for any EU jurisdiction with one click. Complete audit trails maintained automatically, investigators love our documentation.",
        features: [
          "Automated SAR/STR generation with jurisdiction templates",
          "One-click reporting to all EU financial authorities",
          "Complete audit trails stored for 5+ years",
          "Case management with investigation workflows",
          "Real-time regulatory intelligence and rule updates"
        ]
      },
      riskIntelligence: {
        title: "AI That Actually Learns",
        description: "Stop drowning in false positives. Our AI has analyzed millions of EU transactions and knows what real risk looks like. 92% reduction in false alerts means your team focuses on genuine threats.",
        features: [
          "ML models trained on 10M+ verified EU transactions",
          "Region-specific risk patterns for all EU markets",
          "92% reduction in false positive alerts",
          "Continuous learning from your approval decisions",
          "Predictive risk scoring before transactions complete"
        ]
      }
    },
    coreCapabilities: {
      euEidIntegration: {
        title: "EU eID Native Integration",
        description: "Seamless integration with MitID, BankID, Freja, Finnish Trust Network and all major EU eID systems. Automatic routing based on customer location and availability."
      },
      sanctionsScreening: {
        title: "Global Sanctions & PEP Screening",
        description: "Real-time screening against 200+ global sanctions lists, PEP databases, and adverse media sources. Intelligent fuzzy matching reduces false positives by 85%."
      }
    }
  },
  da: {
    badge: "Komplet KYC/AML Platform",
    title: "Det Komplette Compliance Arsenal",
    subtitle: "Alt fra øjeblikkelig kundeverifikation til AI-drevet transaktionsovervågning til regulatorisk rapportering med ét klik. Den eneste platform der dækker alle EU AMLR-krav uden kompromis.",
    platformFeatures: {
      kycVerification: {
        title: "Øjeblikkelig Kundeverifikation",
        description: "Verificer enhver kunde på under 60 sekunder med intelligent eID-routing på tværs af MitID, BankID og Freja. Automatiseret risikovurdering sker i realtid, så du ved præcis hvem du har med at gøre før godkendelse.",
        features: [
          "Smart eID-orkestrering på tværs af alle EU-identitetssystemer",
          "AI-drevet dokumentautenticitetverifikation",
          "Live registeropslag med 15+ EU-forretningsmyndigheder",
          "Øjeblikkelig mapping af reelle ejere",
          "Komplet onboarding på 60 sekunder eller mindre"
        ]
      },
      transactionMonitoring: {
        title: "24/7 Transaktionsintelligens",
        description: "AI der aldrig sover, overvåger hver transaktion for mistænkelige mønstre, struktureringsforsøg og hastighedsanomalier. Fang trusler før de bliver compliance-mareridt.",
        features: [
          "Realtidsovervågning af 100% af transaktioner",
          "Adfærdsanalyse der opdager mønsterafvigelser",
          "Maskinlæring trænet på 10M+ EU-transaktioner",
          "Dynamisk risikovurdering der tilpasser sig kundeadfærd",
          "Øjeblikkelige advarsler til dit team når tærskler brydes"
        ]
      },
      complianceReporting: {
        title: "Nul-Touch Rapportering",
        description: "Generer revisionsklar regulatorisk rapporter for enhver EU-jurisdiktion med ét klik. Komplette revisionsspor vedligeholdes automatisk, efterforskere elsker vores dokumentation.",
        features: [
          "Automatiseret SAR/STR-generering med jurisdiktionsskabeloner",
          "Et-kliks rapportering til alle EU-finansmyndigheder",
          "Komplette revisionsspor gemt i 5+ år",
          "Sagsstyring med efterforskningsworkflows",
          "Realtids regulatorisk intelligens og regelopdateringer"
        ]
      },
      riskIntelligence: {
        title: "AI Der Faktisk Lærer",
        description: "Stop med at drukne i falske positiver. Vores AI har analyseret millioner af EU-transaktioner og ved hvordan ægte risiko ser ud. 92% reduktion i falske advarsler betyder dit team fokuserer på genuine trusler.",
        features: [
          "ML-modeller trænet på 10M+ verificerede EU-transaktioner",
          "Regionsspecifikke risikomønstre for alle EU-markeder",
          "92% reduktion i falske positive advarsler",
          "Kontinuerlig læring fra dine godkendelsesbeslutninger",
          "Prædiktiv risikovurdering før transaktioner gennemføres"
        ]
      }
    },
    coreCapabilities: {
      euEidIntegration: {
        title: "EU eID Native Integration",
        description: "Sømløs integration med MitID, BankID, Freja, Finnish Trust Network og alle større EU eID-systemer. Automatisk routing baseret på kundeplacering og tilgængelighed."
      },
      sanctionsScreening: {
        title: "Global Sanktions- & PEP-screening",
        description: "Realtidsscreening mod 200+ globale sanktionslister, PEP-databaser og negative mediekilder. Intelligent fuzzy matching reducerer falske positiver med 85%."
      }
    }
  }
};

// Benefits translations for all languages
const benefitsTranslations = {
  en: {
    badge: "The Veridaq Advantage",
    title: "Why Leaders Choose Veridaq",
    subtitle: "Stop juggling five different vendors. Stop drowning in false positives. Stop explaining compliance failures to regulators. One platform that actually works.",
    benefits: {
      onePlatform: {
        title: "One Platform, Zero Gaps",
        description: "Stop duct-taping five different vendors together. Customer verification, transaction monitoring, sanctions screening, beneficial ownership tracking, and regulatory reporting—all in one seamless system."
      },
      fewerfalsePositives: {
        title: "92% Fewer False Positives",
        description: "Your compliance team investigates real threats, not phantom risks. Our AI has analyzed millions of EU transactions and knows what genuine risk looks like. No more alert fatigue."
      },
      fasterOnboarding: {
        title: "10x Faster Customer Onboarding",
        description: "Verify customers in 60 seconds instead of 3 days. Smart eID integration, instant risk scoring, real-time register lookups. Speed that regulators approve of."
      },
      futureProof: {
        title: "Future-Proof Compliance",
        description: "EU AMLR 2027 compliant today. MiCA ready. TFR prepared. When regulations change, you stay compliant automatically. No emergency updates, no expensive migrations."
      }
    },
    platformAdvantages: {
      title: "Platform Advantages",
      deploy: {
        number: "01",
        title: "Deploy in Days, Not Quarters",
        description: "Modern REST APIs, webhooks for real-time events, SDKs in every major language. Comprehensive docs that developers actually enjoy reading. Go live this month."
      },
      builtYourWay: {
        number: "02",
        title: "Built Your Way",
        description: "Configure risk rules, approval workflows, escalation paths that match how your business actually operates. No rigid processes forced on you by consultants."
      },
      coverage: {
        number: "03",
        title: "360° Compliance Coverage",
        description: "KYC verification, ongoing CDD, beneficial ownership tracking, transaction monitoring, sanctions screening, PEP checks, regulatory reporting. Nothing falls through the cracks."
      },
      euNative: {
        number: "04",
        title: "EU-Native, GDPR-First",
        description: "Your data never leaves the EU. Hosted in tier-3+ data centers with 99.9% uptime SLA. Full GDPR compliance isn't a feature—it's our foundation."
      }
    },
    cta: {
      title: "Stop Fighting Compliance. Start Leading Your Market.",
      subtitle: "Join 500+ European financial institutions who've turned compliance from a cost center into a competitive advantage.",
      button: "Contact Our Experts"
    }
  },
  da: {
    badge: "Veridaq-fordelen",
    title: "Hvorfor Ledere Vælger Veridaq",
    subtitle: "Stop med at jonglere fem forskellige leverandører. Stop med at drukne i falske positiver. Stop med at forklare compliance-fejl til tilsynsmyndigheder. Én platform der faktisk virker.",
    benefits: {
      onePlatform: {
        title: "Én Platform, Nul Huller",
        description: "Stop med at tape fem forskellige leverandører sammen. Kundeverifikation, transaktionsovervågning, sanktionsscreening, sporing af reelle ejere og regulatorisk rapportering—alt i ét sømløst system."
      },
      fewerFalsePositives: {
        title: "92% Færre Falske Positiver",
        description: "Dit compliance-team efterforsker ægte trusler, ikke fantomrisici. Vores AI har analyseret millioner af EU-transaktioner og ved hvordan ægte risiko ser ud. Ikke mere advarselstræthed."
      },
      fasterOnboarding: {
        title: "10x Hurtigere Kundeonboarding",
        description: "Verificer kunder på 60 sekunder i stedet for 3 dage. Smart eID-integration, øjeblikkelig risikovurdering, realtids registeropslag. Hastighed som tilsynsmyndigheder godkender."
      },
      futureProof: {
        title: "Fremtidssikret Compliance",
        description: "EU AMLR 2027-compliant i dag. MiCA-klar. TFR-forberedt. Når reguleringer ændres, forbliver du compliant automatisk. Ingen nødopdateringer, ingen dyre migreringer."
      }
    },
    platformAdvantages: {
      title: "Platformfordele",
      deploy: {
        number: "01",
        title: "Deploy på Dage, Ikke Kvartaler",
        description: "Moderne REST API'er, webhooks til realtidshændelser, SDK'er på alle større sprog. Omfattende dokumentation som udviklere rent faktisk nyder at læse. Gå live denne måned."
      },
      builtYourWay: {
        number: "02",
        title: "Bygget Din Vej",
        description: "Konfigurer risikoregler, godkendelsesworkflows, eskaleringsstier der matcher hvordan din virksomhed faktisk opererer. Ingen rigide processer påtvunget af konsulenter."
      },
      coverage: {
        number: "03",
        title: "360° Compliance-dækning",
        description: "KYC-verifikation, løbende CDD, sporing af reelle ejere, transaktionsovervågning, sanktionsscreening, PEP-checks, regulatorisk rapportering. Intet falder gennem revnerne."
      },
      euNative: {
        number: "04",
        title: "EU-Native, GDPR-First",
        description: "Dine data forlader aldrig EU. Hostet i tier-3+ datacentre med 99,9% uptime SLA. Fuld GDPR-compliance er ikke en funktion—det er vores fundament."
      }
    },
    cta: {
      title: "Stop Med at Kæmpe Mod Compliance. Start Med at Lede Dit Marked.",
      subtitle: "Slut dig til 500+ europæiske finansielle institutioner der har vendt compliance fra et omkostningscenter til en konkurrencefordel.",
      button: "Kontakt Vores Eksperter"
    }
  }
};

// Write features translations
for (const [lang, translations] of Object.entries(featuresTranslations)) {
  const filePath = path.join(localesDir, lang, 'features.json');
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n');
  console.log(`✅ Updated ${lang}/features.json`);
}

// Write benefits translations
for (const [lang, translations] of Object.entries(benefitsTranslations)) {
  const filePath = path.join(localesDir, lang, 'benefits.json');
  fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n');
  console.log(`✅ Updated ${lang}/benefits.json`);
}

console.log('\n✨ Features and Benefits translations updated for EN and DA!');
console.log('📝 Note: Other languages need similar comprehensive translations');
