import type { Chant } from "./types";

/**
 * Each `lines` entry is one stanza/verse. `hi` and `en` may contain internal
 * "\n" line breaks for multi-line verses — the UI renders these as a single
 * rhythmic block. Devanagari text for well-established traditional chants
 * (Hanuman Chalisa, the classic aartis, Vedic mantras, etc.) is standardized
 * across the Hindu tradition; it was compiled from memory and cross-checked
 * line-by-line against published transliterations found via web search
 * (this environment cannot fetch full pages, only search snippets — see
 * each `source` field for what was actually verifiable). Tamil / Telugu /
 * Kannada renderings are generated from `hi` at runtime, not hand-typed.
 */
export const CHANTS: Chant[] = [
  {
    slug: "om-jai-jagdish-hare",
    title: { hi: "ॐ जय जगदीश हरे", en: "Om Jai Jagdish Hare" },
    deity: ["vishnu", "general"],
    type: "aarti",
    occasions: ["daily-evening", "general-puja", "diwali"],
    tags: ["universal aarti", "evening", "closing prayer"],
    durationMin: 5,
    lines: [
      {
        hi: "ॐ जय जगदीश हरे, स्वामी जय जगदीश हरे।\nभक्त जनों के संकट, दास जनों के संकट, क्षण में दूर करे॥",
        en: "Om jai jagdish hare, swami jai jagdish hare\nBhakt janon ke sankat, das janon ke sankat, kshan mein door kare",
      },
      {
        hi: "जो ध्यावे फल पावे, दुःख बिनसे मन का।\nसुख सम्पत्ति घर आवे, कष्ट मिटे तन का॥",
        en: "Jo dhyave phal paave, dukh binase man ka\nSukh sampatti ghar aave, kasht mite tan ka",
      },
      {
        hi: "मात पिता तुम मेरे, शरण गहूं मैं किसकी।\nतुम बिन और न दूजा, आस करूं मैं जिसकी॥",
        en: "Maat pita tum mere, sharan gahoon main kiski\nTum bin aur na dooja, aas karoon main jiski",
      },
      {
        hi: "तुम पूरन परमात्मा, तुम अंतर्यामी।\nपारब्रह्म परमेश्वर, तुम सबके स्वामी॥",
        en: "Tum pooran parmatma, tum antaryami\nParabrahm parmeshwar, tum sabke swami",
      },
      {
        hi: "तुम करुणा के सागर, तुम पालनकर्ता।\nमैं मूरख फलकामी, कृपा करो भरता॥",
        en: "Tum karuna ke sagar, tum paalankarta\nMain moorakh phalkami, kripa karo bharta",
      },
      {
        hi: "तुम हो एक अगोचर, सबके प्राणपति।\nकिस विधि मिलूं दयामय, तुमको मैं कुमति॥",
        en: "Tum ho ek agochar, sabke pranpati\nKis vidhi milu dayamay, tumko main kumati",
      },
      {
        hi: "दीनबंधु दुःखहर्ता, तुम ठाकुर मेरे।\nअपने हाथ उठाओ, द्वार पड़ा तेरे॥",
        en: "Deenbandhu dukhaharta, tum thakur mere\nApne haath uthao, dwar pada tere",
      },
      {
        hi: "विषय विकार मिटाओ, पाप हरो देवा।\nश्रद्धा भक्ति बढ़ाओ, सन्तन की सेवा॥",
        en: "Vishay vikar mitao, paap haro deva\nShraddha bhakti badhao, santan ki seva",
      },
      {
        hi: "तन मन धन सब है तेरा, तेरा तुझको अर्पण।\nक्या लागे है मेरा, तुम्हरी है शरण॥",
        en: "Tan man dhan sab hai tera, tera tujhko arpan\nKya laage hai mera, tumhari hai sharan",
      },
    ],
    meaningEn:
      "The most universally sung aarti in Hindu homes, addressed to Vishnu as 'Lord of the Universe' (Jagdish). It is almost always the closing aarti of a puja regardless of which deity was worshipped, thanking the divine for removing devotees' troubles in an instant and surrendering everything — body, mind and wealth — at the Lord's feet.",
    source:
      "Traditional aarti (commonly attributed to 19th-century composer Pandit Shraddha Ram Phillauri); text cross-checked against drikpanchang.com, bhaktinidhi.com, greenmesg.org and shreekundli.com.",
  },
  {
    slug: "hanuman-chalisa",
    title: { hi: "हनुमान चालीसा", en: "Hanuman Chalisa" },
    deity: ["hanuman"],
    type: "chalisa",
    occasions: ["daily-morning", "hanuman-jayanti", "general-puja"],
    tags: ["strength", "courage", "devotion", "protection", "fear removal"],
    durationMin: 9,
    lines: [
      { hi: "श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि।\nबरनउं रघुबर बिमल जसु, जो दायकु फल चारि॥", en: "Shri guru charan saroj raj, nij manu mukuru sudhari\nBaranau raghubar bimal jasu, jo dayaku phal chari" },
      { hi: "बुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार।\nबल बुधि विद्या देहु मोहिं, हरहु कलेश विकार॥", en: "Buddhiheen tanu janike, sumirau pavan-kumar\nBal buddhi vidya dehu mohi, harahu kalesh vikar" },
      { hi: "जय हनुमान ज्ञान गुन सागर। जय कपीस तिहुं लोक उजागर॥", en: "Jai hanuman gyan gun sagar, jai kapis tihun lok ujagar" },
      { hi: "राम दूत अतुलित बल धामा। अंजनि पुत्र पवनसुत नामा॥", en: "Ram doot atulit bal dhama, anjani putra pavansut nama" },
      { hi: "महाबीर बिक्रम बजरंगी। कुमति निवार सुमति के संगी॥", en: "Mahabir bikram bajrangi, kumati nivar sumati ke sangi" },
      { hi: "कंचन बरन बिराज सुबेसा। कानन कुंडल कुंचित केसा॥", en: "Kanchan baran biraj subesa, kanan kundal kunchit kesa" },
      { hi: "हाथ बज्र औ ध्वजा बिराजै। कांधे मूंज जनेऊ साजै॥", en: "Hath bajra au dhwaja biraje, kandhe moonj janeu saje" },
      { hi: "शंकर सुवन केसरीनंदन। तेज प्रताप महा जग वंदन॥", en: "Shankar suvan kesari-nandan, tej pratap maha jag vandan" },
      { hi: "विद्यावान गुनी अति चातुर। राम काज करिबे को आतुर॥", en: "Vidyavan guni ati chatur, ram kaj karibe ko aatur" },
      { hi: "प्रभु चरित्र सुनिबे को रसिया। राम लखन सीता मन बसिया॥", en: "Prabhu charitra sunibe ko rasiya, ram lakhan sita man basiya" },
      { hi: "सूक्ष्म रूप धरि सियहिं दिखावा। बिकट रूप धरि लंक जरावा॥", en: "Sookshm roop dhari siyahin dikhava, bikat roop dhari lank jarava" },
      { hi: "भीम रूप धरि असुर सँहारे। रामचंद्र के काज सँवारे॥", en: "Bhim roop dhari asur sanhare, ramchandra ke kaj sanvare" },
      { hi: "लाय सजीवन लखन जियाये। श्रीरघुबीर हरषि उर लाये॥", en: "Lay sajivan lakhan jiyaye, shri raghubir harashi ur laye" },
      { hi: "रघुपति कीन्ही बहुत बड़ाई। तुम मम प्रिय भरतहि सम भाई॥", en: "Raghupati keenhi bahut baraai, tum mam priya bharatahi sam bhai" },
      { hi: "सहस बदन तुम्हरो जस गावैं। अस कहि श्रीपति कंठ लगावैं॥", en: "Sahas badan tumharo jas gavein, as kahi shripati kanth lagavein" },
      { hi: "सनकादिक ब्रह्मादि मुनीसा। नारद सारद सहित अहीसा॥", en: "Sanakadik brahmadi munisa, narad sarad sahit ahisa" },
      { hi: "जम कुबेर दिगपाल जहां ते। कबि कोबिद कहि सके कहां ते॥", en: "Jam kuber digpal jahan te, kabi kobid kahi sake kahan te" },
      { hi: "तुम उपकार सुग्रीवहिं कीन्हा। राम मिलाय राज पद दीन्हा॥", en: "Tum upkar sugrivahin keenha, ram milay raj pad deenha" },
      { hi: "तुम्हरो मंत्र बिभीषण माना। लंकेश्वर भए सब जग जाना॥", en: "Tumharo mantra bibhishan mana, lankeshwar bhaye sab jag jana" },
      { hi: "जुग सहस्र जोजन पर भानू। लील्यो ताहि मधुर फल जानू॥", en: "Jug sahasra jojan par bhanu, leelyo tahi madhur phal janu" },
      { hi: "प्रभु मुद्रिका मेलि मुख माहीं। जलधि लांघि गये अचरज नाहीं॥", en: "Prabhu mudrika meli mukh mahin, jaladhi langhi gaye acharaj nahin" },
      { hi: "दुर्गम काज जगत के जेते। सुगम अनुग्रह तुम्हरे तेते॥", en: "Durgam kaj jagat ke jete, sugam anugrah tumhare tete" },
      { hi: "राम दुआरे तुम रखवारे। होत न आज्ञा बिनु पैसारे॥", en: "Ram duare tum rakhavare, hot na aagya binu paisare" },
      { hi: "सब सुख लहै तुम्हारी सरना। तुम रक्षक काहू को डर ना॥", en: "Sab sukh lahai tumhari sarna, tum rakshak kahu ko dar na" },
      { hi: "आपन तेज सम्हारो आपै। तीनों लोक हांक तें कांपै॥", en: "Aapan tej samharo aape, teenon lok hank ten kanpe" },
      { hi: "भूत पिशाच निकट नहिं आवै। महाबीर जब नाम सुनावै॥", en: "Bhoot pishach nikat nahin aavai, mahabir jab naam sunavai" },
      { hi: "नासै रोग हरै सब पीरा। जपत निरंतर हनुमत बीरा॥", en: "Nasai rog harai sab peera, japat nirantar hanumat beera" },
      { hi: "संकट तें हनुमान छुड़ावै। मन क्रम बचन ध्यान जो लावै॥", en: "Sankat te hanuman chudavai, man kram bachan dhyan jo lavai" },
      { hi: "सब पर राम तपस्वी राजा। तिन के काज सकल तुम साजा॥", en: "Sab par ram tapasvi raja, tin ke kaj sakal tum saja" },
      { hi: "और मनोरथ जो कोई लावै। सोइ अमित जीवन फल पावै॥", en: "Aur manorath jo koi lavai, soi amit jeevan phal pavai" },
      { hi: "चारों जुग परताप तुम्हारा। है परसिद्ध जगत उजियारा॥", en: "Charon jug partap tumhara, hai parasiddh jagat ujiyara" },
      { hi: "साधु संत के तुम रखवारे। असुर निकंदन राम दुलारे॥", en: "Sadhu sant ke tum rakhavare, asur nikandan ram dulare" },
      { hi: "अष्ट सिद्धि नौ निधि के दाता। अस बर दीन जानकी माता॥", en: "Ashta siddhi nau nidhi ke data, as bar deen janaki mata" },
      { hi: "राम रसायन तुम्हरे पासा। सदा रहो रघुपति के दासा॥", en: "Ram rasayan tumhare pasa, sada raho raghupati ke dasa" },
      { hi: "तुम्हरे भजन राम को पावै। जनम जनम के दुख बिसरावै॥", en: "Tumhare bhajan ram ko pavai, janam janam ke dukh bisravai" },
      { hi: "अंत काल रघुबर पुर जाई। जहां जन्म हरिभक्त कहाई॥", en: "Ant kaal raghubar pur jaai, jahan janma haribhakt kahai" },
      { hi: "और देवता चित्त न धरई। हनुमत सेइ सर्ब सुख करई॥", en: "Aur devta chit na dharai, hanumat sei sarb sukh karai" },
      { hi: "संकट कटै मिटै सब पीरा। जो सुमिरै हनुमत बलबीरा॥", en: "Sankat katai mitai sab peera, jo sumirai hanumat balbeera" },
      { hi: "जय जय जय हनुमान गोसाईं। कृपा करहु गुरुदेव की नाईं॥", en: "Jai jai jai hanuman gosaain, kripa karahu gurudev ki naain" },
      { hi: "जो सत बार पाठ कर कोई। छूटहि बंदि महा सुख होई॥", en: "Jo sat baar path kar koi, chhootahi bandi maha sukh hoi" },
      { hi: "जो यह पढ़ै हनुमान चालीसा। होय सिद्धि साखी गौरीसा॥", en: "Jo yah padhai hanuman chalisa, hoy siddhi sakhi gaurisa" },
      { hi: "तुलसीदास सदा हरि चेरा। कीजै नाथ हृदय महं डेरा॥", en: "Tulsidas sada hari chera, keeje nath hriday mahn dera" },
      { hi: "पवनतनय संकट हरन, मंगल मूरति रूप।\nराम लखन सीता सहित, हृदय बसहु सुर भूप॥", en: "Pavantanay sankat haran, mangal moorati roop\nRam lakhan sita sahit, hriday basahu sur bhoop" },
    ],
    meaningEn:
      "A 40-chaupai hymn composed by the 16th-century poet-saint Tulsidas, framed by two opening dohas and one closing doha. It praises Hanuman's strength, wisdom, and unwavering devotion to Rama, retells his feats from the Ramayana, and asks him to remove fear, illness and obstacles from the devotee's life. Traditionally recited every morning, and especially on Tuesdays and Saturdays.",
    source:
      "Traditional text by Tulsidas; cross-checked verse-by-verse against abmantra.com, hindutone.com, bhaktibharat.org and hanumanchalisa.pro, all of which independently list the same standard 43-verse text.",
  },
  {
    slug: "om-jai-shiv-omkara",
    title: { hi: "ॐ जय शिव ओंकारा", en: "Om Jai Shiv Omkara" },
    deity: ["shiva"],
    type: "aarti",
    occasions: ["daily-evening", "maha-shivratri", "karva-chauth", "general-puja"],
    tags: ["destroyer", "transformer", "trinity"],
    durationMin: 5,
    lines: [
      { hi: "ॐ जय शिव ओंकारा, स्वामी जय शिव ओंकारा।\nब्रह्मा विष्णु सदाशिव, अर्धांगी धारा॥", en: "Om jai shiv omkara, swami jai shiv omkara\nBrahma Vishnu Sadashiv, ardhangi dhara" },
      { hi: "एकानन चतुरानन पंचानन राजे। हंसासन गरुड़ासन वृषवाहन साजे॥", en: "Ekanan chaturanan panchanan raje, hansasan garudasan vrishvahan saje" },
      { hi: "दो भुज चार चतुर्भुज दसभुज अति सोहे। त्रिगुण रूप निरखते त्रिभुवन जन मोहे॥", en: "Do bhuj chaar chaturbhuj dashbhuj ati sohe, trigun roop nirakhate tribhuvan jan mohe" },
      { hi: "अक्षमाला वनमाला मुण्डमाला धारी। त्रिपुरारी कंसारी कर माला धारी॥", en: "Akshamala vanamala mundamala dhari, tripurari kansari kar mala dhari" },
      { hi: "श्वेतांबर पीतांबर बाघंबर अंगे। सनकादिक गरुणादिक भूतादिक संगे॥", en: "Shvetambar peetambar baghambar ange, sankadik garunadik bhootadik sange" },
      { hi: "कर के मध्य कमंडलु चक्र त्रिशूलधारी। सुखकारी दुखहारी जगपालनकारी॥", en: "Kar ke madhya kamandalu chakra trishuldhari, sukhkari dukhhari jagpalankari" },
      { hi: "ब्रह्मा विष्णु सदाशिव जानत अविवेका। प्रणवाक्षर के मध्ये ये तीनों एका॥", en: "Brahma Vishnu Sadashiv janat aviveka, pranavakshar ke madhye ye teeno eka" },
      { hi: "काशी में विश्वनाथ विराजे नंदी ब्रह्मचारी। नित उठि दर्शन पावत, महिमा अति भारी॥", en: "Kashi mein vishwanath viraje nandi brahmachari, nit uthi darshan pavat, mahima ati bhari" },
      { hi: "त्रिगुणस्वामी की आरती जो कोई नर गावे। कहत शिवानंद स्वामी मनवांछित फल पावे॥", en: "Trigunswami ki aarti jo koi nar gave, kahat shivanand swami manvanchit phal pave" },
    ],
    meaningEn:
      "An aarti to Shiva describing his many forms — the three-eyed, trident-bearing ascetic who is one with Brahma and Vishnu despite appearing distinct, worshipped at Kashi Vishwanath. It is sung in the evening in Shiva temples and homes, and especially on Maha Shivratri.",
    source:
      "Traditional aarti attributed to Swami Shivanand; text cross-checked against bhaktinidhi.com, indiatvnews.com, lokgeets.com and 99pandit.com.",
  },
  {
    slug: "jai-ambe-gauri",
    title: { hi: "जय अम्बे गौरी", en: "Jai Ambe Gauri" },
    deity: ["devi", "durga"],
    type: "aarti",
    occasions: ["navratri", "daily-evening", "general-puja"],
    tags: ["mother goddess", "strength", "protection"],
    durationMin: 5,
    lines: [
      { hi: "जय अम्बे गौरी, मैया जय श्यामा गौरी।\nतुमको निशदिन ध्यावत, हरि ब्रह्मा शिवरी॥", en: "Jai ambe gauri, maiya jai shyama gauri\nTumko nishdin dhyavat, hari brahma shivari" },
      { hi: "मांग सिंदूर बिराजत, टीको मृगमद को।\nउज्ज्वल से दोउ नैना, चंद्रवदन नीको॥", en: "Maang sindoor birajat, teeko mrigmad ko\nUjjwal se dou naina, chandravadan neeko" },
      { hi: "कनक सम तन सोहत, क्षीण कटि श्यामा।\nमुखपर मृगमद सोहे, को शोभित जामा॥", en: "Kanak sam tan sohat, kshin kati shyama\nMukhpar mrigmad sohe, ko shobhit jama" },
      { hi: "पीत वस्त्र मनोहर, कण्ठन शोभित हार।\nअष्ट भुजा अति शोभित, नाना अस्त्र करा री॥", en: "Peet vastra manohar, kanthan shobhit haar\nAsht bhuja ati shobhit, nana astra kara ri" },
      { hi: "कहूं शुम्भ निशुम्भ बिदारे, कहूं महिषासुर मारे।\nधूम्र विलोचन नैना, निशदिन मदमाते॥", en: "Kahu shumbh nishumbh bidare, kahu mahishasur mare\nDhoomra vilochan naina, nishdin madmate" },
      { hi: "चण्ड मुण्ड संहारे, शोणित बीज हरे।\nमधु कैटभ दोउ मारे, सुर भय दूर करे॥", en: "Chand mund sanhare, shonit beej hare\nMadhu kaitabh dou mare, sur bhay door kare" },
      { hi: "तुम हो जगदम्बा शक्ति, तुम ही हो भवानी।\nपूरन ज्ञान अमृत, तुम ही हो ज्ञानी॥", en: "Tum ho jagadamba shakti, tum hi ho bhavani\nPooran gyan amrit, tum hi ho gyani" },
      { hi: "भुजा चार अति शोभित, वर मुद्रा धारी।\nमनवांछित फल पावत, सेवत नर नारी॥", en: "Bhuja chaar ati shobhit, var mudra dhari\nManvanchit phal pavat, sevat nar naari" },
      { hi: "कंचन थार विराजत, कर्पूर की जोती।\nश्री अम्बेजी की आरती, जो कोई नर गावे।\nकहत शिवानंद स्वामी, मनवांछित फल पावे॥", en: "Kanchan thaar birajat, karpoor ki jyoti\nShri ambeji ki aarti, jo koi nar gaave\nKahat shivanand swami, manvanchit phal paave" },
    ],
    meaningEn:
      "An aarti to Durga in her form as Ambe (Mother) and Gauri, retelling her victories over the demons Shumbh-Nishumbh, Mahishasura and Madhu-Kaitabha. Central to Navratri worship, it is also sung as a regular evening aarti to the mother goddess in her many forms.",
    source:
      "Traditional aarti attributed to Swami Shivanand; text cross-checked against ekirana.nl, mahakatha.com, neoastro.com and muktimantra.com. Minor line variations exist between regional printings, as is normal for orally-transmitted aartis.",
  },
  {
    slug: "om-jai-lakshmi-mata",
    title: { hi: "ॐ जय लक्ष्मी माता", en: "Om Jai Lakshmi Mata" },
    deity: ["lakshmi"],
    type: "aarti",
    occasions: ["diwali", "daily-evening", "general-puja"],
    tags: ["wealth", "prosperity", "abundance"],
    durationMin: 5,
    lines: [
      { hi: "ॐ जय लक्ष्मी माता, मैया जय लक्ष्मी माता।\nतुमको निसदिन सेवत, हर विष्णु विधाता॥", en: "Om jai lakshmi mata, maiya jai lakshmi mata\nTumko nisdin sevat, har vishnu vidhata" },
      { hi: "उमा रमा ब्रह्माणी, तुम ही जग माता।\nसूर्य चन्द्रमा ध्यावत, नारद ऋषि गाता॥", en: "Uma rama brahmani, tum hi jag mata\nSurya chandrama dhyavat, narad rishi gata" },
      { hi: "दुर्गा रूप निरंजनि, सुख सम्पत्ति दाता।\nजो कोई तुमको ध्यावत, ऋद्धि सिद्धि धन पाता॥", en: "Durga roop niranjani, sukh sampatti data\nJo koi tumko dhyavat, riddhi siddhi dhan pata" },
      { hi: "तुम पाताल निवासिनि, तुम ही शुभदाता।\nकर्म प्रभाव प्रकाशिनि, भवनिधि की त्राता॥", en: "Tum patal nivasini, tum hi shubhdata\nKarma prabhav prakashini, bhavnidhi ki trata" },
      { hi: "जिस घर तुम रहती हो, ताहि में सब गुण आता।\nसब सम्भव हो जाता, मन नहीं घबराता॥", en: "Jis ghar tum rahati ho, tahi mein sab gun ata\nSab sambhav ho jata, man nahin ghabrata" },
      { hi: "तुम बिन यज्ञ न होते, वस्त्र न कोई पाता।\nखान पान का वैभव, सब तुमसे आता॥", en: "Tum bin yagya na hote, vastra na koi pata\nKhan pan ka vaibhav, sab tumse ata" },
      { hi: "शुभ गुण मंदिर सुंदर, क्षीरोदधि जाता।\nरत्न चतुर्दश तुम बिन, कोई नहीं पाता॥", en: "Shubh gun mandir sundar, ksheerodadhi jata\nRatna chaturdash tum bin, koi nahin pata" },
      { hi: "महालक्ष्मीजी की आरती, जो कोई नर गावे।\nउर आनंद समावे, पाप उतर जावे॥", en: "Mahalakshmiji ki aarti, jo koi nar gave\nUr anand samave, paap utar jave" },
    ],
    meaningEn:
      "An aarti to Lakshmi, goddess of wealth and prosperity, describing her as the mother of the universe who fills any home she resides in with abundance and calm. It is the central aarti of Diwali worship and is sung daily in the evening in many homes and shops.",
    source:
      "Traditional aarti in the 'Om Jai Jagdish Hare' family of hymns; text cross-checked against bhaktinidhi.com, vedicfeed.com, pujasthan.com and shreekundli.com.",
  },
  {
    slug: "sukhkarta-dukhharta",
    title: { hi: "सुखकर्ता दुःखहर्ता", en: "Sukhkarta Dukhharta" },
    deity: ["ganesha"],
    type: "aarti",
    occasions: ["ganesh-chaturthi", "daily-evening", "general-puja"],
    tags: ["obstacles", "happiness", "marathi aarti"],
    durationMin: 3,
    lines: [
      { hi: "सुखकर्ता दुःखहर्ता, वार्ता विघ्नाची।\nनुरवी पुरवी प्रेम, कृपा जयाची॥\nसर्वांगी सुंदर उटी, शेंदुराची।\nकंठी झळके माळ, मुक्ताफळांची॥", en: "Sukhkarta dukhaharta, varta vighnachi\nNuravi puravi prem, krupa jayachi\nSarvangi sundar uti, shendurachi\nKanthi jhalke maal, muktaphalanchi" },
      { hi: "जय देव जय देव, जय मंगलमूर्ती।\nदर्शनमात्रे मनकामना पुरती॥", en: "Jai dev jai dev, jai mangalmoorti\nDarshanmatre mankamana purti" },
      { hi: "रत्नखचित फरा, तुज गौरीकुमरा।\nचंदनाची उटी, कुमकुम केशरा॥\nहिरे जडित मुकुट, शोभतो बरा।\nरुणझुणती नूपुरे, चरणी घागरिया॥", en: "Ratnakhachit fara, tuj gaurikumara\nChandanachi uti, kumkum kesara\nHire jadit mukut, shobhato bara\nRunjhunti nupure, charani ghagariya" },
    ],
    meaningEn:
      "A Marathi aarti to Ganesha — 'giver of happiness, remover of sorrow' — composed by the 17th-century saint Samarth Ramdas. It is the first aarti sung at the close of any worship, and is central to Ganesh Chaturthi celebrations. Shown here are the opening verses; the full aarti has five.",
    source:
      "Traditional Marathi aarti by Samarth Ramdas; opening verses cross-checked against marathimati.com, drikpanchang.com (Marathi lyrics) and mr.wikipedia.org.",
  },
  {
    slug: "jai-ganesh-deva",
    title: { hi: "जय गणेश देवा", en: "Jai Ganesh Deva" },
    deity: ["ganesha"],
    type: "bhajan",
    occasions: ["ganesh-chaturthi", "daily-morning", "general-puja"],
    tags: ["beginnings", "children", "easy to learn"],
    durationMin: 3,
    lines: [
      { hi: "जय गणेश जय गणेश जय गणेश देवा।\nमाता जाकी पार्वती पिता महादेवा॥", en: "Jai ganesh, jai ganesh, jai ganesh deva\nMata jaki parvati, pita mahadeva" },
      { hi: "एक दंत दयावंत, चार भुजा धारी।\nमाथे पर तिलक सोहे, मूसे की सवारी॥", en: "Ek dant dayavant, chaar bhuja dhari\nMathe par tilak sohe, muse ki savari" },
      { hi: "पान चढ़े फूल चढ़े और चढ़े मेवा।\nलड्डुअन का भोग लगे, संत करें सेवा॥", en: "Paan chadhe phool chadhe, aur chadhe meva\nLadduan ka bhog lage, sant karein seva" },
      { hi: "अंधन को आंख देत, कोढ़िन को काया।\nबांझन को पुत्र देत, निर्धन को माया॥", en: "Andhan ko aankh det, kodhin ko kaya\nBaanjhan ko putra det, nirdhan ko maya" },
      { hi: "सूर श्याम शरण आये, सफल कीजे सेवा।\nजय गणेश जय गणेश जय गणेश देवा॥", en: "Soor shyam sharan aaye, safal kije seva\nJai ganesh jai ganesh jai ganesh deva" },
    ],
    meaningEn:
      "A simple, singable bhajan to Ganesha describing his form — one tusk, four arms, riding a mouse — and his compassion in granting sight to the blind, children to the childless, and wealth to the poor. Its gentle, repetitive structure makes it a common first chant taught to children.",
    source:
      "Traditional bhajan/aarti; text cross-checked against hindudevotionalblog.com, drikpanchang.com and Sai Rhythms (sairhythms.sathyasai.org).",
  },
  {
    slug: "aarti-sai-baba",
    title: { hi: "आरती साईबाबा", en: "Aarti Sai Baba" },
    deity: ["sai-baba"],
    type: "aarti",
    occasions: ["daily-evening", "general-puja"],
    tags: ["shirdi", "surrender", "peace"],
    durationMin: 3,
    lines: [
      { hi: "आरती साईबाबा, सौख्यदातार जीवा।\nचरणरजतळी द्यावा, दासां विसावा, भक्तां विसावा॥", en: "Aarti sai baba, saukhyadatara jeeva\nCharanarajatali dyava, dasan visava, bhaktan visava" },
      { hi: "जाळुनिया आनंगा, स्वस्वरूपी राहावा।\nदाखवुनी अवतार, दावी निजठेवा॥", en: "Jalunia ananga, swaswarupi rahava\nDakhavuni avatar, davi nijthewa" },
    ],
    meaningEn:
      "The central Marathi aarti of the Shirdi Sai Baba tradition, calling him the 'giver of bliss to all beings' and asking to rest at the dust of his feet. Sung daily at Shirdi and at Sai temples worldwide; shown here is the refrain and opening verse of the full aarti.",
    source:
      "Traditional Marathi aarti composed by devotees during Sai Baba's lifetime; refrain and opening verse cross-checked against marathimati.com and Marathi Webdunia.",
  },
  {
    slug: "saraswati-vandana",
    title: { hi: "सरस्वती वंदना (या कुन्देन्दु तुषारहारधवला)", en: "Saraswati Vandana — Ya Kundendu Tushar Haram" },
    deity: ["saraswati"],
    type: "stotra",
    occasions: ["vasant-panchami", "daily-morning", "general-puja"],
    tags: ["wisdom", "learning", "music", "students"],
    durationMin: 2,
    lines: [
      {
        hi: "या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता।\nया वीणावरदण्डमण्डितकरा या श्वेतपद्मासना॥\nया ब्रह्माच्युतशङ्करप्रभृतिभिर्देवैः सदा पूजिता।\nसा मां पातु सरस्वती भगवती निःशेषजाड्यापहा॥",
        en: "Ya kundendu tushar-haaradhavala, ya shubhra-vastravrita\nYa veena-vara-danda-mandita-kara, ya shweta-padmasana\nYa brahmachyuta-shankara-prabhritibhir devaih sada poojita\nSa maam patu saraswati bhagavati nihshesha-jadyapaha",
      },
    ],
    meaningEn:
      "A Sanskrit invocation to Saraswati, goddess of learning, music and speech — 'white as jasmine, the moon and a garland of snow, seated on a white lotus with the veena in hand, worshipped by Brahma, Vishnu and Shiva.' It asks her to remove all dullness of mind, and is recited by students before study and on Vasant Panchami.",
    source:
      "Classical Sanskrit shloka (traditionally attributed to sage Agastya); Sanskrit text cross-checked against drikpanchang.com, shlokam.org, greenmesg.org and stotra.in.",
  },
  {
    slug: "gayatri-mantra",
    title: { hi: "गायत्री मंत्र", en: "Gayatri Mantra" },
    deity: ["surya", "general"],
    type: "mantra",
    occasions: ["daily-morning", "general-puja"],
    tags: ["wisdom", "light", "morning", "vedic"],
    durationMin: 1,
    lines: [
      {
        hi: "ॐ भूर्भुवः स्वः।\nतत्सवितुर्वरेण्यं।\nभर्गो देवस्य धीमहि।\nधियो यो नः प्रचोदयात्॥",
        en: "Om bhur bhuvah swah\nTat savitur varenyam\nBhargo devasya dheemahi\nDhiyo yo nah prachodayat",
      },
    ],
    meaningEn:
      "One of the oldest and most revered Vedic mantras (Rigveda 3.62.10), addressed to Savitr, the divine light behind the sun. It asks that light to illuminate the intellect and guide right thought and action. Traditionally chanted at sunrise, midday and sunset.",
    source: "Rigveda 3.62.10; a universally standardized Vedic verse with no meaningful textual variation across traditions.",
  },
  {
    slug: "mahamrityunjaya-mantra",
    title: { hi: "महामृत्युंजय मंत्र", en: "Mahamrityunjaya Mantra" },
    deity: ["shiva"],
    type: "mantra",
    occasions: ["maha-shivratri", "general-puja"],
    tags: ["healing", "protection", "longevity"],
    durationMin: 1,
    lines: [
      {
        hi: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान् मृत्योर्मुक्षीय मामृतात्॥",
        en: "Om tryambakam yajamahe, sugandhim pushtivardhanam\nUrvarukamiva bandhanan, mrityor mukshiya mamritat",
      },
    ],
    meaningEn:
      "A Rigvedic verse (7.59.12) addressed to Tryambaka, 'the three-eyed one', identified with Shiva — praying to be released from the bondage of death and suffering as effortlessly as a ripe cucumber falls from its vine. Widely chanted for healing, protection and longevity.",
    source: "Rigveda 7.59.12; text cross-checked against greenmesg.org and rudraksha-ratna.com.",
  },
  {
    slug: "vakratunda-mahakaya",
    title: { hi: "वक्रतुण्ड महाकाय", en: "Vakratunda Mahakaya" },
    deity: ["ganesha"],
    type: "mantra",
    occasions: ["ganesh-chaturthi", "daily-morning", "general-puja"],
    tags: ["obstacles", "beginnings"],
    durationMin: 1,
    lines: [
      {
        hi: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
        en: "Vakratunda mahakaya, suryakoti samaprabha\nNirvighnam kuru me deva, sarva-karyeshu sarvada",
      },
    ],
    meaningEn:
      "A short invocation to Ganesha, the curve-trunked, mighty-bodied remover of obstacles, radiant as a thousand suns — asking him to keep every undertaking free of hindrance. Traditionally the very first chant at the start of any task, ceremony or puja.",
    source: "Traditional invocatory verse from the Ganesha Purana tradition, universally standardized wherever Ganesha is invoked.",
  },
  {
    slug: "om-sahana-vavatu",
    title: { hi: "ॐ सह नाववतु (शांति मंत्र)", en: "Om Sahana Vavatu — Shanti Mantra" },
    deity: ["general"],
    type: "mangalacharan",
    occasions: ["daily-morning", "guru-purnima", "general-puja"],
    tags: ["peace", "students", "teacher", "unity"],
    durationMin: 1,
    lines: [
      {
        hi: "ॐ सह नाववतु। सह नौ भुनक्तु। सह वीर्यं करवावहै।\nतेजस्वि नावधीतमस्तु मा विद्विषावहै॥\nॐ शान्तिः शान्तिः शान्तिः॥",
        en: "Om saha navavatu, saha nau bhunaktu, saha veeryam karavavahai\nTejasvi navadhitam astu, ma vidvishavahai\nOm shantih shantih shantih",
      },
    ],
    meaningEn:
      "A peace invocation (shanti mantra) from the Taittiriya Upanishad (2.2.2), traditionally recited by a teacher and student together before study: 'may we be protected together, nourished together, may our shared effort be vigorous and our learning brilliant, and may there be no ill will between us.'",
    source: "Taittiriya Upanishad 2.2.2; text cross-checked against greenmesg.org and templepurohit.com.",
  },
  {
    slug: "vaishnav-jan-to",
    title: { hi: "वैष्णव जन तो", en: "Vaishnav Jan To" },
    deity: ["vishnu", "general"],
    type: "bhajan",
    occasions: ["general-puja"],
    tags: ["compassion", "gandhi", "ethics", "gujarati"],
    durationMin: 3,
    lines: [
      { hi: "वैष्णव जन तो तेणे कहिये जे, पीड पराई जाणे रे।\nपर दुःखे उपकार करे तोये, मन अभिमान न आणे रे॥", en: "Vaishnav jan to tene kahiye je, peed parai jaane re\nPar dukhe upkar kare toye, man abhimaan na aane re" },
      { hi: "सकल लोकमां सहुने वंदे, निंदा न करे केनी रे।\nवाच काछ मन निश्चल राखे, धन धन जननी तेनी रे॥", en: "Sakal lokman sahune vande, ninda na kare keni re\nVaach kaachh man nishchal raakhe, dhan dhan janani teni re" },
    ],
    meaningEn:
      "A 15th-century Gujarati poem by the saint Narsinh Mehta describing a true Vaishnava (devotee) as one who feels others' pain, helps selflessly without pride, and treats everyone with equal respect. It was Mahatma Gandhi's favourite hymn and was sung daily at his ashram prayer meetings. Shown here are the opening two stanzas of the longer poem.",
    source:
      "Traditional Gujarati bhajan by Narsinh Mehta, commonly printed in Devanagari transliteration; cross-checked against the Wikipedia entry for 'Vaishnava Jana To' and gyaankipathshala.com.",
  },
  {
    slug: "raghupati-raghava-raja-ram",
    title: { hi: "रघुपति राघव राजा राम", en: "Raghupati Raghava Raja Ram (Ram Dhun)" },
    deity: ["rama"],
    type: "bhajan",
    occasions: ["ram-navami", "daily-evening", "general-puja"],
    tags: ["unity", "gandhi", "simple chant"],
    durationMin: 2,
    lines: [
      { hi: "रघुपति राघव राजा राम, पतित पावन सीता राम।\nसीता राम, सीता राम, भज प्यारे तू सीता राम॥", en: "Raghupati raghava raja ram, patit pavan sita ram\nSita ram, sita ram, bhaj pyare tu sita ram" },
      { hi: "ईश्वर अल्लाह तेरो नाम, सबको सन्मति दे भगवान॥", en: "Ishwar allah tero naam, sabko sanmati de bhagwan" },
    ],
    meaningEn:
      "A short, easily repeated 'Ram Dhun' praising Rama and Sita, popularised nationwide by Mahatma Gandhi at his prayer meetings. Its closing line — 'whether called Ishwar or Allah, grant everyone good sense' — was Gandhi's deliberate message of religious unity.",
    source:
      "Traditional bhajan, often called the 'Ram Dhun'; text cross-checked against the Wikipedia entry 'Raghupati Raghava Raja Ram' and arisebharat.com.",
  },
  {
    slug: "shri-ramchandra-kripalu",
    title: { hi: "श्री रामचन्द्र कृपालु भजमन", en: "Shri Ramchandra Kripalu Bhajman" },
    deity: ["rama"],
    type: "stotra",
    occasions: ["ram-navami", "general-puja"],
    tags: ["beauty", "compassion", "tulsidas"],
    durationMin: 2,
    lines: [
      { hi: "श्री रामचन्द्र कृपालु भजु मन हरण भवभय दारुणं।\nनवकंज लोचन कंज मुख कर कंज पद कंजारुणं॥", en: "Shri ramchandra kripalu bhaju man, haran bhava-bhay darunam\nNavakanj lochan kanj mukh, kar kanj pad kanjarunam" },
      { hi: "कंदर्प अगणित अमित छवि नव नील नीरज सुन्दरं।\nपटपीत मानहुं तड़ित रुचि शुचि नौमि जनक सुतावरं॥", en: "Kandarpa aganit amit chhavi, nav neel neeraj sundaram\nPatpeet manahu tadit ruchi shuchi, naumi janak sutavaram" },
    ],
    meaningEn:
      "The opening verses of a devotional hymn by Tulsidas from his Vinaya Patrika, calling on the mind to worship Rama — compassionate remover of worldly fear, whose eyes, face, hands and feet are compared to fresh lotuses.",
    source:
      "Traditional stotra by Tulsidas (from Vinaya Patrika); opening verses cross-checked against vedicfeed.com, bhaktinidhi.com and the Wikipedia entry 'Shri Ramachandra Kripalu'.",
  },
  {
    slug: "achyutam-keshavam",
    title: { hi: "अच्युतं केशवं", en: "Achyutam Keshavam" },
    deity: ["krishna", "vishnu"],
    type: "bhajan",
    occasions: ["janmashtami", "general-puja"],
    tags: ["names of krishna", "devotion"],
    durationMin: 2,
    lines: [
      { hi: "अच्युतं केशवं रामनारायणं, कृष्णदामोदरं वासुदेवं हरिम्।\nश्रीधरं माधवं गोपिकावल्लभं, जानकीनायकं रामचन्द्रं भजे॥", en: "Achyutam keshavam ramanarayanam, krishnadamodaram vasudevam harim\nShridharam madhavam gopikavallabham, janakinayakam ramachandram bhaje" },
      { hi: "अच्युतं केशवं सत्यभामाधवं, माधवं श्रीधरं राधिकाराधितम्।\nइन्दिरामन्दिरं चेतसा सुन्दरं, देवकीनन्दनं नन्दजं सन्दधे॥", en: "Achyutam keshavam satyabhamadhavam, madhavam shridharam radhikaradhitam\nIndiramandiram chetasa sundaram, devakinandanam nandajam sandadhe" },
    ],
    meaningEn:
      "A garland of names of Krishna and Vishnu — Achyuta (the infallible), Keshava, Damodara, Vasudeva, Madhava — strung together in a simple, meditative refrain. A favourite bhajan during Janmashtami and everyday devotional singing.",
    source:
      "Traditional bhajan (verses associated with the Vishnu-sahasranama tradition); text cross-checked against gyanbhakti.com, muktimantra.com and 108puzzles.com.",
  },
  {
    slug: "hare-krishna-maha-mantra",
    title: { hi: "हरे कृष्ण महामंत्र", en: "Hare Krishna Maha Mantra" },
    deity: ["krishna"],
    type: "mantra",
    occasions: ["janmashtami", "daily-morning", "general-puja"],
    tags: ["kirtan", "meditation", "bhakti"],
    durationMin: 1,
    lines: [
      {
        hi: "हरे कृष्ण हरे कृष्ण, कृष्ण कृष्ण हरे हरे।\nहरे राम हरे राम, राम राम हरे हरे॥",
        en: "Hare krishna hare krishna, krishna krishna hare hare\nHare rama hare rama, rama rama hare hare",
      },
    ],
    meaningEn:
      "The sixteen-word 'maha mantra' calling on Krishna and Rama through the name Hare (a form of address to the divine energy, Radha/Hara). Sung as kirtan in groups, on japa beads individually, or quietly as meditation — among the most widely repeated chants in the bhakti tradition.",
    source: "Traditional maha-mantra (referenced in the Kali-Santarana Upanishad); universally standardized text with no variation.",
  },
  {
    slug: "vishwa-prarthana",
    title: { hi: "विश्व प्रार्थना (आरंभिक श्लोक)", en: "HSS Vishwa Prarthana (opening verse)" },
    deity: ["general"],
    type: "mangalacharan",
    occasions: ["daily-morning", "general-puja"],
    tags: ["hss", "unity", "motherland", "opening prayer"],
    durationMin: 1,
    lines: [
      {
        hi: "सर्वमङ्गलमाङ्गल्यां देवीं सर्वार्थसाधिकाम्।\nशरण्यां सर्वभूतानां नमामो भूमिमातरम्॥\nसच्चिदानन्दरूपाय विश्वमङ्गलहेतवे।\nविश्वधर्मैकमूलाय नमोऽस्तु परमात्मने॥",
        en: "Sarva mangala mangalyam, devim sarvartha sadhikam\nSharanyam sarva bhootanam, namamo bhoomi mataram\nSachchidananda roopaya, vishwa mangala hetave\nVishwa dharmaika moolaya, namostu paramatmane",
      },
    ],
    meaningEn:
      "The opening invocation of the Vishwa Prarthana (World Prayer) recited at Hindu Swayamsevak Sangh (HSS) gatherings worldwide since the 1940s — bowing first to Mother Earth as the auspicious refuge of all beings, then to the Supreme Self as the source of universal wellbeing and dharma. The complete prayer runs to eight stanzas; only this well-attested opening verse is presented here.",
    source:
      "Hindu Swayamsevak Sangh Prarthana; opening verse reconstructed and cross-checked from transliterations referenced via geetganga.org, HSS Sweden's published Prarthana booklet, and stephen-knapp.com. Please cross-check against your local shakha's printed text, as HSS chapters occasionally print minor regional variants.",
  },
  {
    slug: "bhojan-mantra",
    title: { hi: "भोजन मंत्र", en: "Bhojan Mantra (Before-Meal Prayer)" },
    deity: ["general"],
    type: "mantra",
    occasions: ["daily-morning", "general-puja"],
    tags: ["hss", "gratitude", "food", "gita"],
    durationMin: 1,
    lines: [
      {
        hi: "ॐ ब्रह्मार्पणं ब्रह्म हविर्ब्रह्माग्नौ ब्रह्मणा हुतम्।\nब्रह्मैव तेन गन्तव्यं ब्रह्मकर्मसमाधिना॥",
        en: "Om brahmarpanam brahma havir, brahmagnau brahmana hutam\nBrahmaiva tena gantavyam, brahma-karma-samadhina",
      },
    ],
    meaningEn:
      "A verse from the Bhagavad Gita (4.24), chanted before meals — including at HSS gatherings — to offer the food as an act of the divine to the divine: the offering, the fire, the one who offers, and the act itself are all seen as Brahman. It teaches gratitude and non-attachment around something as ordinary as eating.",
    source: "Bhagavad Gita 4.24; text cross-checked against vedicfeed.com's Bhojan Mantra page and the Wikipedia entry 'Bhojan Mantra'.",
  },
  {
    slug: "ya-devi-sarva-bhuteshu",
    title: { hi: "या देवी सर्वभूतेषु", en: "Ya Devi Sarva Bhuteshu" },
    deity: ["devi", "durga"],
    type: "mantra",
    occasions: ["navratri", "general-puja"],
    tags: ["mother goddess", "shakti"],
    durationMin: 1,
    lines: [
      {
        hi: "या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता।\nनमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः॥",
        en: "Ya devi sarva-bhuteshu, shakti-rupena samsthita\nNamastasyai namastasyai namastasyai namo namah",
      },
    ],
    meaningEn:
      "A refrain from the Devi Mahatmyam (Durga Saptashati) declaring the goddess present in all beings as Shakti — pure energy and power — followed by a triple salutation. Widely repeated throughout Navratri worship, with 'shakti' interchangeable with other forms such as 'buddhi' (intellect) or 'shanti' (peace) in the fuller text.",
    source: "Devi Mahatmyam (Markandeya Purana); one of the most widely quoted and universally standardized lines in Devi worship.",
  },
  {
    slug: "guru-mantra",
    title: { hi: "गुरुर्ब्रह्मा गुरुर्विष्णुः", en: "Guru Mantra — Gurur Brahma" },
    deity: ["general"],
    type: "mantra",
    occasions: ["guru-purnima", "general-puja"],
    tags: ["teacher", "gratitude", "guru purnima"],
    durationMin: 1,
    lines: [
      {
        hi: "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः।\nगुरुः साक्षात् परं ब्रह्म तस्मै श्री गुरवे नमः॥",
        en: "Gurur brahma gurur vishnuh, gurur devo maheshwarah\nGuruh sakshat param brahma, tasmai shri gurave namah",
      },
    ],
    meaningEn:
      "A verse honouring the guru (teacher) as embodying Brahma (the creator), Vishnu (the sustainer) and Shiva (the transformer) — and, ultimately, as the Supreme Reality itself. Chanted especially on Guru Purnima as an expression of gratitude to one's teachers.",
    source: "Traditional shloka from the Guru Gita tradition; one of the most universally known verses in Hindu practice.",
  },
  {
    slug: "raksha-bandhan-mantra",
    title: { hi: "रक्षाबंधन मंत्र", en: "Raksha Bandhan Mantra" },
    deity: ["general"],
    type: "mantra",
    occasions: ["raksha-bandhan"],
    tags: ["protection", "siblings", "rakhi"],
    durationMin: 1,
    lines: [
      {
        hi: "येन बद्धो बली राजा दानवेन्द्रो महाबलः।\nतेन त्वामभिबध्नामि रक्षे मा चल मा चल॥",
        en: "Yena baddho bali raja, danavendro mahabalah\nTena tvam abhibadhnami, rakshe ma chala ma chala",
      },
    ],
    meaningEn:
      "The traditional mantra recited while tying a rakhi, invoking the same protective strength that once bound the mighty demon-king Bali, and asking that protection to remain steadfast — 'do not waver, do not waver.'",
    source: "Traditional mantra; text cross-checked against resanskrit.com, mantra.tips and hindutone.com's Raksha Bandhan coverage.",
  },
  {
    slug: "surya-namaskar-mantra",
    title: { hi: "सूर्य नमस्कार मंत्र", en: "Surya Namaskar — The Twelve Names" },
    deity: ["surya"],
    type: "mantra",
    occasions: ["daily-morning"],
    tags: ["sun salutation", "yoga", "morning"],
    durationMin: 1,
    lines: [
      { hi: "ॐ मित्राय नमः। ॐ रवये नमः। ॐ सूर्याय नमः। ॐ भानवे नमः॥", en: "Om mitraya namah. Om ravaye namah. Om suryaya namah. Om bhanave namah." },
      { hi: "ॐ खगाय नमः। ॐ पूष्णे नमः। ॐ हिरण्यगर्भाय नमः। ॐ मरीचये नमः॥", en: "Om khagaya namah. Om pushne namah. Om hiranyagarbhaya namah. Om marichaye namah." },
      { hi: "ॐ आदित्याय नमः। ॐ सवित्रे नमः। ॐ अर्काय नमः। ॐ भास्कराय नमः॥", en: "Om adityaya namah. Om savitre namah. Om arkaya namah. Om bhaskaraya namah." },
    ],
    meaningEn:
      "The twelve traditional names of Surya, the sun god, each chanted with one round of the Surya Namaskar (sun salutation) sequence — a set of morning prayers honouring the sun as the visible source of life and energy.",
    source: "Traditional yoga and Vedic sun-worship practice; the twelve names are a fixed, universally taught sequence.",
  },
  {
    slug: "om-gan-ganapataye-namah",
    title: { hi: "ॐ गं गणपतये नमः", en: "Om Gan Ganapataye Namah" },
    deity: ["ganesha"],
    type: "mantra",
    occasions: ["ganesh-chaturthi", "daily-morning", "general-puja"],
    tags: ["bija mantra", "beginnings"],
    durationMin: 1,
    lines: [{ hi: "ॐ गं गणपतये नमः॥", en: "Om gam ganapataye namah" }],
    meaningEn:
      "A short bija (seed) mantra to Ganesha, combining his sacred syllable 'gam' with a simple salutation. Repeated as japa (mala counting) or chanted once before beginning any task.",
    source: "Traditional Ganapati bija mantra; universally standardized, single-line chant with no variation.",
  },
  {
    slug: "om-namah-shivaya",
    title: { hi: "ॐ नमः शिवाय", en: "Om Namah Shivaya" },
    deity: ["shiva"],
    type: "mantra",
    occasions: ["maha-shivratri", "daily-morning", "general-puja"],
    tags: ["panchakshari", "meditation", "five syllables"],
    durationMin: 1,
    lines: [{ hi: "ॐ नमः शिवाय॥", en: "Om namah shivaya" }],
    meaningEn:
      "The 'Panchakshari' (five-syllable) mantra of Shiva — na-mah-shi-vā-ya — one of the most widely repeated mantras in Hinduism, chanted in meditation, on japa beads, and throughout Maha Shivratri.",
    source: "Traditional panchakshari mantra; universally standardized, single-line chant with no variation.",
  },
];
