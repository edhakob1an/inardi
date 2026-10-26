// iNardi translations.
// The game is written in English; when another language is on, text is swapped as it appears on screen.
// Keys are the English text exactly as shown. {0}, {1}… stand for any text (numbers, names), in the order they
// appear in the English; {#0} stands for a number only. Captured parts are translated too when they have an entry.
(function () {
  'use strict';
  const LS = 'nardi.lang';
  const LANGS = { en: 'English', hy: 'Հայերեն' };
  let lang = 'en';
  try { const v = JSON.parse(localStorage.getItem(LS)); if (LANGS[v]) lang = v; else if (/^hy\b/i.test(navigator.language || '')) lang = 'hy'; } catch { if (/^hy\b/i.test(navigator.language || '')) lang = 'hy'; }

  const HY = {
    // ---- studio, menu
    'presents': 'ներկայացնում է',
    'Guest': 'Հյուր', 'Guest {#0}': 'Հյուր {0}', '{0} (you)': '{0} (դու)',
    'Ready for a game': 'Պատրաստ ես խաղի',
    'SHORT': 'ԿԱՐՃ', 'LONG': 'ԵՐԿԱՐ',
    'PLAY ONLINE': 'ԽԱՂԱԼ ՕՆԼԱՅՆ', 'ROOMS FROM 100 COINS': 'ՍԵՂԱՆՆԵՐ՝ 100 ՄԵՏԱՂԱԴՐԱՄԻՑ',
    'VS BOT': 'ԲՈՏԻ ԴԵՄ', 'FRIEND': 'ԸՆԿԵՐ', 'NEW': 'ՆՈՐ',
    'Shop': 'Խանութ', 'Free coins': 'Անվճար', 'Friends': 'Ընկերներ', 'Leaders': 'Ռեյտինգ', 'Settings': 'Կարգավորում',
    'Your profile': 'Քո պրոֆիլը', 'Level': 'Մակարդակ', 'Daily bonus': 'Օրվա բոնուս', 'Get coins': 'Ստանալ մետաղադրամ', 'Get pearls': 'Ստանալ մարգարիտ',
    'Nardi board': 'Նարդու տախտակ', 'Switch between short and long': 'Փոխել կարճի և երկարի միջև', 'Back': 'Հետ',
    'Close preview': 'Փակել դիտումը', 'Reset view': 'Վերականգնել տեսքը', 'Games won': 'Շահած խաղեր', 'Game menu': 'Խաղի մենյու',
    'Send an emoji or phrase': 'Ուղարկել էմոջի կամ արտահայտություն', 'Undo move': 'Հետ վերցնել քայլը',
    'Classic rules · hit single checkers': 'Դասական կանոններ · կարելի է խփել միայնակ քարերը',
    'No hitting · all 15 start on the head': 'Առանց խփելու · բոլոր 15-ը սկսում են գլխից',

    // ---- rooms
    'Play online': 'Օնլայն խաղ',
    'BRONZE': 'ԲՐՈՆԶԵ', 'SILVER': 'ԱՐԾԱԹԵ', 'GOLD': 'ՈՍԿԵ', 'DIAMOND': 'ԱԴԱՄԱՆԴԵ', 'ROYAL': 'ԱՐՔԱՅԱԿԱՆ',
    'Bronze': 'Բրոնզե', 'Silver': 'Արծաթե', 'Gold': 'Ոսկե', 'Diamond': 'Ադամանդե', 'Royal': 'Արքայական',
    'Win {#0}': 'Շահում՝ {0}',
    'How rooms work.': 'Ինչպես են աշխատում սեղանները։',
    'You and your opponent each put in the stake. The winner takes the pot. A mars does not change the prize.': 'Դու և մրցակիցդ դնում եք նույն խաղադրույքը։ Հաղթողը վերցնում է ամբողջ գումարը։ Մարսը մրցանակը չի փոխում։',
    'INVITE A FRIEND': 'ՀՐԱՎԻՐԵԼ ԸՆԿԵՐՈՋԸ',
    '{0} nardi. Pick a table and we match you with a player at the same stake.': '{0} նարդի։ Ընտրիր սեղանը, և մենք կգտնենք նույն խաղադրույքով խաղացող։',
    'Short': 'Կարճ', 'Long': 'Երկար', '{0} nardi': '{0} նարդի', '{0} nardi{1}': '{0} նարդի{1}', 'short': 'կարճ', 'long': 'երկար',

    // ---- leaderboard
    'Leaderboard': 'Առաջատարներ', 'WINS': 'Հաղթանակներ', 'COINS WON': 'Շահած գումար',
    'The leaderboard needs a connection.': 'Աղյուսակի համար կապ է պետք։',
    'This week · ends in': 'Այս շաբաթ · ավարտվում է',
    '{#0}d {#1}h': '{0} օր {1} ժ', '{#0}h {#1}m': '{0} ժ {1} ր', '{#0}m': '{0} ր',
    '{0} Only coin-room games count.': '{0} Հաշվվում են միայն սեղանների խաղերը։',
    'Top 10 by wins get coins: 1st 5,000 · 2nd 3,000 · 3rd 2,000 · 4th–10th 500.': 'Լավագույն 10-ը ըստ հաղթանակների ստանում են մետաղադրամ․ 1-ին՝ 5,000 · 2-րդ՝ 3,000 · 3-րդ՝ 2,000 · 4–10-րդ՝ 500։',
    'Coins won in coin rooms this week. Prizes go by the Wins board.': 'Այս շաբաթ սեղաններում շահած մետաղադրամները։ Մրցանակները տրվում են ըստ Հաղթանակների աղյուսակի։',
    'Nobody on the board yet this week.': 'Այս շաբաթ աղյուսակում դեռ ոչ ոք չկա։',
    'Win a game in a coin room to be the first.': 'Հաղթիր սեղանի խաղում և եղիր առաջինը։',
    'Win a game in a coin room to join the board.': 'Հաղթիր սեղանի խաղում՝ աղյուսակ մտնելու համար։',
    '{0} coins won': '{0} շահած մետաղադրամ', '{#0} win': '{0} հաղթանակ', '{#0} wins': '{0} հաղթանակ',
    'Lv {0}': 'Մկ. {0}',

    // ---- friends
    'Playing a game': 'Խաղում է', 'Wants to be your friend': 'Ուզում է ընկերանալ', 'Waiting for them to add you back': 'Սպասում ենք, որ քեզ էլ ավելացնի',
    'INVITE': 'ՀՐԱՎԻՐԵԼ', 'More': 'Ավելին', 'ADD BACK': 'ԱՎԵԼԱՑՆԵԼ', 'Remove': 'Հեռացնել', 'Cancel request': 'Չեղարկել հայտը',
    'Invites are for {0} nardi. Switch the game on the main menu.': 'Հրավերները {0} նարդու համար են։ Խաղը փոխիր գլխավոր մենյուում։',
    'REQUESTS': 'ՀԱՅՏԵՐ', 'FRIENDS': 'ԸՆԿԵՐՆԵՐ', 'SENT': 'ՈՒՂԱՐԿՎԱԾ',
    'No friends yet.': 'Դեռ ընկերներ չունես։', 'After an online game, tap': 'Օնլայն խաղից հետո սեղմիր', 'ADD FRIEND': 'ԱՎԵԼԱՑՆԵԼ ԸՆԿԵՐ',
    'to add your opponent. When they add you back, you can see when they are online and invite them with one tap.': '՝ մրցակցիդ ավելացնելու համար։ Երբ նա էլ քեզ ավելացնի, կտեսնես, թե երբ է օնլայն, և կհրավիրես մեկ հպումով։',
    'Friends need a connection.': 'Ընկերների համար կապ է պետք։',
    'Remove friend': 'Հեռացնել ընկերներից', 'You and {0} are friends': 'Դու և {0} ընկերներ եք',
    'Friends ✓': 'Ընկերներ եք ✓', 'Friend request sent ✓': 'Հայտն ուղարկված է ✓', 'Add back as friend': 'Ավելացնել ընկերների մեջ', 'Add friend': 'Ավելացնել ընկեր',

    // ---- shop
    'CASES': 'Սնդուկ', 'BOARDS': 'Տախտակ', 'CHECKERS': 'Քարեր', 'DICE': 'Զառեր', 'AVATARS': 'Ավատար', 'FRAMES': 'ՇՐՋԱՆԱԿՆԵՐ',
    'Loading 3D…': '3D-ն բեռնվում է…', 'Tap the case to open it': 'Հպիր սնդուկին՝ բացելու համար',
    'Preview {0} in 3D': 'Դիտել 3D-ով՝ {0}',
    'Achievement': 'Նվաճում', '🎁 Gold case only': '🎁 Միայն Ոսկե սնդուկից', 'EQUIPPED': 'ԸՆՏՐՎԱԾ Է', 'EQUIP': 'ԸՆՏՐԵԼ',
    'Not enough pearls': 'Մարգարիտները չեն բավականացնում', '{0} costs {1} pearls. You have {2}.': '{0}՝ {1} մարգարիտ։ Քեզ մոտ կա {2}։',
    'GET PEARLS': 'ՍՏԱՆԱԼ ՄԱՐԳԱՐԻՏ', 'BUY AND EQUIP': 'ԳՆԵԼ ԵՎ ԸՆՏՐԵԼ', 'Cancel': 'Չեղարկել',
    'Tap to flip · Drag to turn · Pinch to zoom': 'Հպիր՝ շրջելու · Քաշիր՝ պտտելու · Երկու մատով՝ մեծացնելու',
    'Tap to roll · Drag to turn · Pinch to zoom': 'Հպիր՝ գցելու · Քաշիր՝ պտտելու · Երկու մատով՝ մեծացնելու',
    'Drag to turn · Pinch to zoom · Tap to close': 'Քաշիր՝ պտտելու · Երկու մատով՝ մեծացնելու · Հպիր՝ փակելու',
    'Could not open the 3D preview': 'Չհաջողվեց բացել 3D դիտումը',
    'Preview': 'Փորձնական',
    'Pearls buy boards, checkers, dice, avatars, frames and cases.': 'Մարգարիտներով կարելի է գնել տախտակներ, քարեր, զառեր, ավատարներ, շրջանակներ և սնդուկներ։',
    'In this preview, packs are added free. Real prices come with Google Play billing.': 'Այս փորձնական տարբերակում փաթեթներն ավելանում են անվճար։ Իրական գները կլինեն Google Play-ի միջոցով։',
    'Watch an ad · +50': 'Դիտել գովազդ · +50',
    '{0} is yours': '{0} — հիմա քոնն է',
    'board': 'տախտակ', 'checker set': 'քարերի հավաքածու', 'dice set': 'զառերի հավաքածու', 'avatar': 'ավատար', 'frame': 'շրջանակ',

    // items: boards
    'Ararat Walnut': 'Արարատյան ընկույզ', 'Carved vines and pomegranates with Mount Ararat medallions.': 'Փորագրված որթատունկ և նռներ՝ Արարատ լեռան մեդալիոններով։',
    'Golden Oak': 'Ոսկե կաղնի', 'Light oak, apricot-wood inlay and carved pomegranate branches.': 'Բաց կաղնի, ծիրանենու ներդիր և փորագրված նռան ճյուղեր։',
    'Pearl Ebony': 'Մարգարտյա էբենոս', 'Black ebony inlaid with mother-of-pearl and gold.': 'Սև էբենոս՝ սադափի և ոսկու ներդիրներով։',
    'Pink Tuff': 'Վարդագույն տուֆ', 'The rose-pink stone of Yerevan, carved lace and a black basalt bar.': 'Երևանի վարդագույն քարը, փորագրված ժանյակ և սև բազալտե միջնամաս։',
    'Royal Garnet': 'Արքայական նռնաքար', 'Garnet-red cherry under glossy lacquer, with gold-leaf lines and a golden pomegranate tree.': 'Նռնագույն բալենի՝ փայլուն լաքի տակ, ոսկեթերթ գծերով և ոսկե նռնենիով։',
    // checkers
    'Ivory & Mahogany': 'Փղոսկր և կարմրափայտ', 'The classic pair. Polished ivory and red mahogany.': 'Դասական զույգ։ Հղկված փղոսկր և կարմիր կարմրափայտ։',
    'Bone & Walnut': 'Ոսկոր և ընկույզ', 'Cream bone with a walnut rim, and dark walnut.': 'Կրեմագույն ոսկոր՝ ընկուզենու եզրով, և մուգ ընկույզ։',
    'Pearl & Garnet': 'Մարգարիտ և նռնաքար', 'Mother-of-pearl and garnet lacquer, gold rims.': 'Սադափ և նռնագույն լաք, ոսկե եզրեր։',
    'Tuff & Basalt': 'Տուֆ և բազալտ', 'Rose-pink tuff against polished black basalt, two Armenian stones.': 'Վարդագույն տուֆ և հղկված սև բազալտ՝ երկու հայկական քար։',
    'Amber & Onyx': 'Սաթ և օնիքս', 'Honey amber against black onyx, both with thin gold rims.': 'Մեղրագույն սաթ և սև օնիքս, երկուսն էլ՝ բարակ ոսկե եզրերով։',
    // dice
    'Bronze Ivory': 'Բրոնզե փղոսկր', 'Ivory dice, dark pips and a bronze eternity sign on the one.': 'Փղոսկրե զառեր, մուգ կետեր և բրոնզե հավերժության նշան մեկի վրա։',
    'Walnut & Bone': 'Ընկույզ և ոսկոր', 'Dark walnut dice with bone pips and a carved bone eternity sign.': 'Մուգ ընկուզենու զառեր՝ ոսկրե կետերով և փորագրված ոսկրե հավերժության նշանով։',
    'Pearl & Gold': 'Մարգարիտ և ոսկի', 'Mother-of-pearl dice with gold pips and a gold eternity sign.': 'Սադափե զառեր՝ ոսկե կետերով և ոսկե հավերժության նշանով։',
    'Obsidian & Gold': 'Օբսիդիան և ոսկի', 'Black Armenian obsidian with gold pips and a gold eternity sign.': 'Սև հայկական օբսիդիան՝ ոսկե կետերով և ոսկե հավերժության նշանով։',
    'Lapis & Silver': 'Լազուրիտ և արծաթ', 'Deep blue lapis lazuli with gold flecks, silver pips and a silver eternity sign.': 'Մուգ կապույտ լազուրիտ՝ ոսկե բծերով, արծաթե կետերով և արծաթե հավերժության նշանով։',
    // avatars
    'Your checker': 'Քո քարը', 'Your light checker, whatever set you play with.': 'Քո բաց գույնի քարը, որ հավաքածուով էլ խաղաս։',
    'Mount Ararat': 'Արարատ լեռ', 'The carved Ararat medallion of the walnut board.': 'Ընկույզե տախտակի փորագրված Արարատի մեդալիոնը։',
    'Pomegranate': 'Նուռ', 'Carved pomegranate branches in light oak.': 'Փորագրված նռան ճյուղեր բաց կաղնու վրա։',
    'Pearl Star': 'Մարգարտյա աստղ', 'The mother-of-pearl star of the ebony board.': 'Էբենոսե տախտակի սադափե աստղը։',
    'Eternity Stone': 'Հավերժության քար', 'The eternity sign carved in pink tuff.': 'Վարդագույն տուֆի վրա փորագրված հավերժության նշանը։',
    'Golden Branch': 'Ոսկե ճյուղ', 'A gold-leaf pomegranate branch on garnet lacquer.': 'Ոսկեթերթ նռան ճյուղ՝ նռնագույն լաքի վրա։',
    'Gold Eternity': 'Ոսկե հավերժություն', 'A polished gold eternity sign on black obsidian.': 'Հղկված ոսկե հավերժության նշան՝ սև օբսիդիանի վրա։',
    'Black Pearl': 'Սև մարգարիտ', 'A lustrous pearl on black silk. Only from Gold cases.': 'Փայլուն մարգարիտ սև մետաքսի վրա։ Միայն Ոսկե սնդուկներից։',
    'Royal Crown': 'Արքայական թագ', 'Only for winners of the Royal 10,000 room.': 'Միայն Արքայական 10,000 սեղանի հաղթողների համար։',
    'Ararat Gold': 'Ոսկե Արարատ', 'Only for players who finished a week as number one.': 'Միայն նրանց համար, ովքեր շաբաթն ավարտել են առաջին տեղում։',
    'Silver Eternity': 'Արծաթե հավերժություն', 'A polished silver eternity sign on deep lapis.': 'Հղկված արծաթե հավերժության նշան՝ մուգ լազուրիտի վրա։',
    // frames
    'No frame': 'Առանց շրջանակի', 'A simple thin line.': 'Պարզ բարակ գիծ։',
    'A warm bronze ring.': 'Տաք բրոնզե օղակ։', 'A bright polished silver ring.': 'Պայծառ հղկված արծաթե օղակ։', 'A glowing gold ring.': 'Շողշողուն ոսկե օղակ։',
    'Garnet': 'Նռնաքար', 'Deep red garnet with a gold edge.': 'Մուգ կարմիր նռնաքար՝ ոսկե եզրով։',
    'Lapis': 'Լազուրիտ', 'Royal blue lapis with a gold edge.': 'Արքայական կապույտ լազուրիտ՝ ոսկե եզրով։',
    'A turning ring of diamond light. The rarest frame you can buy.': 'Ադամանդե լույսի պտտվող օղակ։ Գնվող ամենահազվագյուտ շրջանակը։',
    'Pearl String': 'Մարգարտաշար', 'A ring of real pearls. Only from Gold cases.': 'Իսկական մարգարիտների օղակ։ Միայն Ոսկե սնդուկներից։',
    'Golden Laurel': 'Ոսկե դափնի', 'Only for players who finished a week in the top 10.': 'Միայն նրանց համար, ովքեր շաբաթն ավարտել են լավագույն 10-ում։',

    // ---- cases
    'Bronze case': 'Բրոնզե սնդուկ', 'Silver case': 'Արծաթե սնդուկ', 'Gold case': 'Ոսկե սնդուկ',
    'Coins and pearls, sometimes a dice or checker set.': 'Մետաղադրամներ և մարգարիտներ, երբեմն՝ զառերի կամ քարերի հավաքածու։',
    'Bigger prizes and a chance at a board or frame.': 'Ավելի մեծ մրցանակներ և տախտակ կամ շրջանակ ստանալու հնարավորություն։',
    'The best prizes, and the only way to get legendary items.': 'Լավագույն մրցանակները և լեգենդար իրեր ստանալու միակ միջոցը։',
    'Common': 'Սովորական', 'Rare': 'Հազվագյուտ', 'Epic': 'Էպիկական', 'Legendary': 'Լեգենդար',
    'Cases need a connection.': 'Սնդուկների համար կապ է պետք։',
    'Free daily case': 'Անվճար օրական սնդուկ', 'A Bronze case, free every day.': 'Բրոնզե սնդուկ՝ ամեն օր անվճար։',
    'CLAIM': 'ՎԵՐՑՆԵԼ', 'OPEN': 'ԲԱՑԵԼ', 'Chances': 'Հավանականություն',
    'You also get cases from level-ups (Silver every 5th level) and from the weekly leaderboard. Items you already own turn into pearls.': 'Սնդուկներ ստանում ես նաև նոր մակարդակների համար (Արծաթե՝ ամեն 5-րդ մակարդակին) և շաբաթական աղյուսակից։ Արդեն ունեցած իրերը վերածվում են մարգարիտների։',
    '{0} coins': '{0} մետաղադրամ', '{0} pearls': '{0} մարգարիտ',
    'Rare: a dice or checker set': 'Հազվագյուտ՝ զառերի կամ քարերի հավաքածու',
    'Epic: a board, frame or premium avatar': 'Էպիկական՝ տախտակ, շրջանակ կամ պրեմիում ավատար',
    'Legendary: case-only Black Pearl avatar, Pearl String frame or Diamond frame': 'Լեգենդար՝ միայն սնդուկից․ Սև մարգարիտ ավատար, Մարգարտաշար կամ Ադամանդե շրջանակ',
    'Chances for each opening': 'Հավանականությունը յուրաքանչյուր բացման ժամանակ',
    'If you already own the item, you get pearls instead: Rare 30, Epic 80, Legendary 200.': 'Եթե իրն արդեն ունես, փոխարենը մարգարիտ ես ստանում․ Հազվագյուտ՝ 30, Էպիկական՝ 80, Լեգենդար՝ 200։',
    'Free Bronze case added': 'Անվճար Բրոնզե սնդուկն ավելացվեց',
    'You already have it, so you get {0} pearls instead.': 'Այն արդեն ունես, ուստի փոխարենը ստանում ես {0} մարգարիտ։',
    'New {0}. Equip it in the Shop.': 'Նոր {0}։ Ընտրիր այն Խանութում։',
    'Added to your balance.': 'Ավելացվեց հաշվիդ։', 'Open another ({0})': 'Բացել ևս մեկը ({0})', 'COLLECT': 'ՎԵՐՑՆԵԼ',

    // ---- bot / friend / ad / settings sheets
    'Play the bot': 'Խաղալ բոտի հետ', '{0} nardi, no coins at stake.': '{0} նարդի, առանց խաղադրույքի։',
    'Easy': 'Հեշտ', 'Relaxed. Makes mistakes.': 'Հանգիստ է։ Սխալներ է անում։', 'Hard': 'Դժվար', 'Plays to win.': 'Խաղում է հաղթելու համար։',
    'Play a friend': 'Խաղալ ընկերոջ հետ', 'Invite online': 'Հրավիրել օնլայն', 'Send a link or a code': 'Ուղարկիր հղում կամ կոդ',
    'Join with a code': 'Միանալ կոդով', 'Enter your friend’s 6-letter code': 'Մուտքագրիր ընկերոջդ 6-նիշանոց կոդը',
    'Two players, one phone': 'Երկու խաղացող, մեկ հեռախոս', 'Pass and play, side by side': 'Կողք կողքի, հերթով',
    'Not enough coins': 'Մետաղադրամները չեն բավականացնում', 'The {0} table needs {1} coins. You have {2}.': '{0} սեղանի համար պետք է {1} մետաղադրամ։ Քեզ մոտ կա {2}։',
    'WATCH AD · +50': 'ԴԻՏԵԼ ԳՈՎԱԶԴ · +50', 'Watch a short video and get 50 coins.': 'Դիտիր կարճ տեսանյութ և ստացիր 50 մետաղադրամ։',
    'In this preview the ad is skipped and the coins are added straight away.': 'Այս փորձնական տարբերակում գովազդը բաց է թողնվում, և մետաղադրամներն ավելանում են անմիջապես։',
    'Not now': 'Ոչ հիմա', 'GET COINS': 'ՍՏԱՆԱԼ ՄԵՏԱՂԱԴՐԱՄ',
    'Change your avatar and frame in the Shop.': 'Ավատարն ու շրջանակը կարող ես փոխել Խանութում։',
    'How to play': 'Ինչպես խաղալ', 'Rules of short and long nardi': 'Կարճ և երկար նարդու կանոնները',
    'Music': 'Երաժշտություն', 'Sounds': 'Ձայներ', 'Close': 'Փակել',
    'Language': 'Լեզու', 'Choose the language of the game': 'Ընտրիր խաղի լեզուն',

    // ---- game screen
    'Bot': 'Բոտ', 'You': 'Դու', 'Player': 'Խաղացող', 'A player': 'Խաղացող', 'Light': 'Բաց', 'Dark': 'Մուգ', 'LIGHT': 'ԲԱՑԸ', 'DARK': 'ՄՈՒԳԸ',
    'Bot · Easy': 'Բոտ · Հեշտ', 'Bot · Hard': 'Բոտ · Դժվար',
    'ROLL': 'ԳՑԵԼ', 'ROLL · {0}': 'ԳՑԵԼ · {0}',
    'Auto-roll': 'Ավտոգցում', 'Roll the dice automatically when your turn starts.': 'Զառերը գցվում են ինքնաբերաբար, երբ գալիս է քո հերթը։',
    'ON': 'ՄԻԱՑՎԱԾ', 'OFF': 'ԱՆՋԱՏՎԱԾ',
    '{0} pips · {1} off': '{0} միավոր · {1} հանված',
    '{#0} move left': 'Մնաց {0} քայլ', '{#0} moves left': 'Մնաց {0} քայլ',
    'Sending…': 'Ուղարկվում է…', 'Game over': 'Խաղն ավարտվեց', 'Deciding first move': 'Որոշում ենք՝ ով է սկսում',
    'Rolling…': 'Գցում է…', 'Their turn': 'Մրցակցի հերթն է', 'Bot is thinking': 'Բոտը մտածում է',
    'No legal moves': 'Թույլատրելի քայլ չկա', '{0} has no moves': '{0} քայլ չունի',
    '{0} starts': 'Սկսում է՝ {0}', 'You start': 'Դու ես սկսում', 'Bot starts': 'Բոտն է սկսում',
    'Resume': 'Շարունակել', 'Resign': 'Հանձնվել', 'Restart game': 'Սկսել նորից',
    "Opponent's messages: {0}": 'Մրցակցի հաղորդագրությունները՝ {0}', 'hidden': 'թաքցված', 'shown': 'ցուցադրվում են',
    'Finish this game first': 'Նախ ավարտիր այս խաղը',
    // rules
    'Both games:': 'Երկու խաղում էլ․', 'Short:': 'Կարճ․', 'Long:': 'Երկար․', 'Got it': 'Պարզ է',
    'roll, then move checkers by each die. You must use both dice if you can; if only one can be played, you must play the larger. Doubles are played four times. Bring all 15 into your home quarter, then bear them off. If the opponent bore off none, it is a mars and counts double.':
      'գցիր զառերը, ապա շարժիր քարերը յուրաքանչյուր զառի թվով։ Պետք է օգտագործես երկու զառն էլ, եթե հնարավոր է․ եթե միայն մեկն է հնարավոր, պետք է խաղաս մեծը։ Զույգը (դուբլը) խաղում են չորս անգամ։ Բոլոր 15 քարերը բեր քո տուն, հետո հանիր դրանք։ Եթե մրցակիցը ոչ մի քար չի հանել, դա մարս է և հաշվվում է կրկնակի։',
    'you move opposite to your opponent. A single checker is a blot; landing on it sends it to the bar, and it must re-enter before anything else moves. Two or more checkers hold a point.':
      'քայլում ես մրցակցիդ հակառակ ուղղությամբ։ Միայնակ քարը բաց է․ դրա վրա կանգնելով այն ուղարկում ես մեջտեղ, և այն պետք է նորից մտնի խաղ, մինչև որևէ այլ քար շարժվի։ Երկու կամ ավելի քարերը պահում են դաշտը։',
    'both sides move the same way, starting from the head. No hitting: you cannot land on any point the opponent holds. Only one checker leaves the head per turn, except a first roll of 6-6, 4-4 or 3-3. You may not build a wall of six points unless an opponent checker is already past it.':
      'երկու կողմն էլ շարժվում են նույն ուղղությամբ՝ սկսելով գլխից։ Խփել չի կարելի․ չես կարող կանգնել մրցակցի զբաղեցրած դաշտում։ Ամեն հերթին գլխից կարող է դուրս գալ միայն մեկ քար, բացի առաջին 6-6, 4-4 կամ 3-3 գցումից։ Չի կարելի կառուցել վեց դաշտանոց պատ, եթե մրցակցի որևէ քար արդեն չի անցել այն։',
    // end of game
    'MARS · DOUBLE WIN': 'ՄԱՐՍ · ԿՐԿՆԱԿԻ ՀԱՂԹԱՆԱԿ', 'MARS!': 'ՄԱՐՍ!', 'DOUBLE WIN': 'ԿՐԿՆԱԿԻ ՀԱՂԹԱՆԱԿ', 'YOU WIN': 'ՀԱՂԹԵՑԻՐ', '{0} WINS': '{0} ՀԱՂԹԵՑ',
    '{0} wins': '{0} հաղթեց', 'You win': 'Դու հաղթեցիր', 'Bot wins': 'Բոտը հաղթեց', 'You lose': 'Պարտվեցիր',
    'Mars: the other side bore off nothing, so this game counts double.': 'Մարս․ մրցակիցը ոչ մի քար չհանեց, ուստի այս խաղը հաշվվում է կրկնակի։',
    'A clean win.': 'Մաքուր հաղթանակ։', 'PLAY AGAIN': 'ԽԱՂԱԼ ԿՐԿԻՆ', 'Main menu': 'Գլխավոր մենյու',
    '{0} resigned.': '{0} հանձնվեց։', 'You resigned.': 'Դու հանձնվեցիր։', '{0} ran out of time.': '{0}՝ ժամանակը սպառվեց։', 'You ran out of time.': 'Քո ժամանակը սպառվեց։',
    'Mars: no checkers were borne off by the loser.': 'Մարս․ պարտվողը ոչ մի քար չհանեց։', 'All fifteen checkers borne off.': 'Բոլոր տասնհինգ քարերը հանված են։',
    'New opponent': 'Նոր մրցակից', 'REMATCH': 'ՌԵՎԱՆՇ', '+{0} COINS': '+{0} ՄԵՏԱՂԱԴՐԱՄ',
    '+50 coins': '+50 մետաղադրամ', '+{0} coins': '+{0} մետաղադրամ', '+{0} pearls': '+{0} մարգարիտ',
    // quick chat (sent as a number, so each player sees their own language)
    'Hi!': 'Բարև!', 'Good luck!': 'Հաջողություն!', 'Nice move!': 'Լավ քայլ էր!', 'Lucky roll!': 'Բախտդ բերեց!', 'Wow!': 'Վա՜յ', 'Oops!': 'Ուպս',
    'Hurry up!': 'Շուտ արա!', 'Thanks!': 'Շնորհակալություն!', 'Well played!': 'Լավ խաղացիր!', 'Good game!': 'Լավ խաղ էր!', 'Hehe': 'Հեհե', 'Thinking…': 'Մտածում եմ…',

    // ---- online
    'Not done': 'Չստացվեց', 'Online play': 'Օնլայն խաղ',
    'Online games need the published iNardi app or website. Bot games and two players on one phone still work.': 'Օնլայն խաղի համար պետք է iNardi-ի հավելվածը կամ կայքը։ Բոտի հետ և մեկ հեռախոսով երկուսով խաղալը աշխատում են։',
    'TRY AGAIN': 'ՆՈՐԻՑ ՓՈՐՁԵԼ',
    '{0} table': '{0} սեղան', '{0} nardi · stake {1} · winner takes {2}': '{0} նարդի · խաղադրույք {1} · հաղթողը ստանում է {2}',
    'Looking for an opponent…': 'Մրցակից ենք փնտրում…', 'Looking for an opponent… {#0}s': 'Մրցակից ենք փնտրում… {0} վ',
    'A player is waiting at': 'Խաղացող է սպասում՝', '· {0} nardi': '· {0} նարդի', 'JOIN THEM': 'ՄԻԱՆԱԼ',
    'Invite a friend': 'Հրավիրել ընկերոջը', 'They are online now.': 'Նա հիմա օնլայն է։',
    'They are offline right now. They will see the invite if they open iNardi in the next 10 minutes.': 'Նա հիմա օֆլայն է։ Հրավերը կտեսնի, եթե առաջիկա 10 րոպեում բացի iNardi-ն։',
    'Invite sent': 'Հրավերն ուղարկված է', 'Waiting for': 'Սպասում ենք՝', 'to accept a game of {0} nardi…': 'որ ընդունի {0} նարդու խաղը…', 'to accept…': 'որ ընդունի…',
    'Cancel invite': 'Չեղարկել հրավերը', 'SHARE LINK': 'ԿԻՍՎԵԼ ՀՂՈՒՄՈՎ', 'COPY LINK': 'ՊԱՏՃԵՆԵԼ ՀՂՈՒՄԸ',
    '{0} nardi. Send this code or link. The game starts when your friend joins.': '{0} նարդի։ Ուղարկիր այս կոդը կամ հղումը։ Խաղը կսկսվի, երբ ընկերդ միանա։',
    'Waiting for your friend…': 'Սպասում ենք ընկերոջդ…', 'No game': 'Խաղ չկա', 'Invite expired': 'Հրավերի ժամկետն անցել է',
    '{0} said no, or the invite expired.': '{0} մերժեց, կամ հրավերի ժամկետն անցավ։',
    'Join a friend': 'Միանալ ընկերոջը', 'Enter the 6-letter code from your friend.': 'Մուտքագրիր ընկերոջդ ուղարկած 6-նիշանոց կոդը։',
    'JOIN GAME': 'ՄԻԱՆԱԼ ԽԱՂԻՆ', 'Invite code': 'Հրավերի կոդ', 'Joining…': 'Միանում ենք…', 'The code has 6 letters and numbers.': 'Կոդը 6 տառ և թիվ ունի։',
    'Play nardi with me on iNardi! Code {0}': 'Արի նարդի խաղանք iNardi-ում! Կոդը՝ {0}',
    'Link copied': 'Հղումը պատճենվեց', 'Copy the link above': 'Պատճենիր վերևի հղումը',
    'You lose your {0} coin stake.': 'Կկորցնես քո {0} մետաղադրամի խաղադրույքը։', 'Your opponent wins this game.': 'Մրցակիցդ կհաղթի այս խաղում։',
    'Resign?': 'Հանձնվե՞լ', 'RESIGN': 'ՀԱՆՁՆՎԵԼ', 'Keep playing': 'Շարունակել խաղը',
    'Name saved': 'Անունը պահպանվեց', 'Connected': 'Միացված է', 'UPDATE': 'ԹԱՐՄԱՑՆԵԼ',
    'Your name': 'Քո անունը', 'SAVE': 'ՊԱՀՊԱՆԵԼ', 'Change name': 'Փոխել անունը',
    '· stake {0} coins': '· խաղադրույք՝ {0} մետաղադրամ', 'Rematch?': 'Ռևա՞նշ', '{0} wants to play again.': '{0} ուզում է նորից խաղալ։',
    'No thanks': 'Ոչ, շնորհակալություն', 'Game invite': 'Խաղի հրավեր', '{0} invites you to a game of {1} nardi.': '{0} քեզ հրավիրում է {1} նարդու խաղի։', 'PLAY': 'ԽԱՂԱԼ',
    'The invite was cancelled': 'Հրավերը չեղարկվեց', 'Rematch': 'Ռևանշ', 'The request stays open for 10 minutes.': 'Հայտը բաց է մնում 10 րոպե։',
    'No rematch': 'Ռևանշ չի լինի', '{0} said no or has left.': '{0} մերժեց կամ դուրս եկավ։',
    // server errors
    'Not enough coins for this table.': 'Այս սեղանի համար մետաղադրամները չեն բավականացնում։', 'You already have a game in progress.': 'Դու արդեն ունես ընթացիկ խաղ։',
    'That code is not valid any more.': 'Այդ կոդն այլևս վավեր չէ։', 'That is your own invite. Send it to a friend.': 'Սա քո սեփական հրավերն է։ Ուղարկիր այն ընկերոջդ։',
    'Use 2–16 letters or numbers.': 'Օգտագործիր 2–16 տառ կամ թիվ։', 'Please wait a moment before the next reward.': 'Մի պահ սպասիր մինչև հաջորդ պարգևը։',
    'No connection to the server. Check your internet.': 'Սերվերի հետ կապ չկա։ Ստուգիր ինտերնետը։', 'That game is not over yet.': 'Այդ խաղը դեռ չի ավարտվել։',
    'Your opponent has left.': 'Մրցակիցդ հեռացել է։', 'Your opponent is already playing another game.': 'Մրցակիցդ արդեն ուրիշ խաղ է խաղում։',
    'Your opponent does not have enough coins for this stake.': 'Մրցակցիդ մետաղադրամները չեն բավականացնում այս խաղադրույքի համար։',
    'You can add players after you have played a game together.': 'Խաղացողին կարող ես ավելացնել միասին խաղալուց հետո։',
    'You can only invite friends who added you back.': 'Կարող ես հրավիրել միայն այն ընկերներին, ովքեր քեզ էլ են ավելացրել։',
    'Your friends list is full.': 'Ընկերների ցուցակդ լիքն է։', 'You already took today’s bonus.': 'Այսօրվա բոնուսն արդեն վերցրել ես։',
    'The game changed. Syncing…': 'Խաղը փոխվել է։ Համաժամեցվում է…', 'That move was refused. Syncing…': 'Այդ քայլը մերժվեց։ Համաժամեցվում է…',
    'Something went wrong ({0}).': 'Ինչ-որ բան սխալ գնաց ({0})։',

    // ---- daily, levels, profile, prizes
    'Day {0}': 'Օր {0}',
    'Day {0} of 7. Come back every day: the reward grows, and day 7 pays {1}. Miss a day and it starts again from day 1.': 'Օր {0}՝ 7-ից։ Վերադարձիր ամեն օր․ պարգևը մեծանում է, և 7-րդ օրը տալիս է {1}։ Եթե մի օր բաց թողնես, ամեն ինչ կսկսվի 1-ին օրից։',
    'You already took today’s bonus. Come back tomorrow for the next one.': 'Այսօրվա բոնուսն արդեն վերցրել ես։ Վերադարձիր վաղը հաջորդի համար։',
    'CLAIM {0}': 'ՎԵՐՑՆԵԼ {0}', 'Later': 'Հետո', 'GREAT': 'ՀԻԱՆԱԼԻ', 'Day {0} bonus. See you tomorrow!': 'Օր {0}-ի բոնուսը։ Կհանդիպենք վաղը!',
    'Level up! You are now level {0}': 'Նոր մակարդակ! Հիմա դու {0}-րդ մակարդակում ես', '+{0} coins · {1} case': '+{0} մետաղադրամ · {1} սնդուկ',
    'Level {0}': 'Մակարդակ {0}', 'LEVEL': 'ՄԱԿԱՐԴԱԿ', 'LEVEL {0}': 'ՄԱԿԱՐԴԱԿ {0}',
    'Online games': 'Օնլայն խաղեր', 'Wins': 'Հաղթանակ', 'Win rate': 'Հաղթանակի %', 'Best streak{0}': 'Լավագույն շարք{0}', '· now {0}': '· հիմա {0}',
    'Mars wins': 'Մարսով հաղթանակ', 'Coins won': 'Շահած մետաղադրամ', 'Against the bot': 'Բոտի դեմ',
    'Against the bot: {0} wins of {1} games': 'Բոտի դեմ՝ {0} հաղթանակ {1} խաղից', '{0} wins of {1}': '{0} հաղթանակ {1}-ից',
    'Online': 'Օնլայն', 'Offline': 'Օֆլայն', '· since {0}': '· խաղում է {0}-ից', '· next level pays {0} coins': '· հաջորդ մակարդակը կտա {0} մետաղադրամ',
    'Weekly prize': 'Շաբաթական մրցանակ', 'You finished': 'Անցած շաբաթվա աղյուսակում դու', 'on last week’s leaderboard.': 'տեղում ես։',
    // achievements
    'Achievements': 'Նվաճումներ', '’s achievements': '-ի նվաճումները', '{0} of {1} earned': 'Ձեռք է բերված {0}-ը {1}-ից', '{0} / {1} tiers': '{0} / {1} աստիճան',
    '{0} · next tier': '{0} · հաջորդ աստիճան', 'Progress': 'Առաջընթաց', 'Completed': 'Ավարտված է', 'Achievements need a connection.': 'Նվաճումների համար կապ է պետք։',
    'ACHIEVEMENT{0}': 'ՆՎԱՃՈՒՄ{0}', 'New {0} unlocked: {1}': 'Բացվեց նոր {0}՝ {1}',
    'First Blood': 'Առաջին հաղթանակ', 'Win your first online game.': 'Հաղթիր քո առաջին օնլայն խաղը։',
    'Champion': 'Չեմպիոն', 'Win online games.': 'Հաղթիր օնլայն խաղերում։',
    'Hot Streak': 'Թեժ շարք', 'Win online games in a row.': 'Հաղթիր օնլայն խաղերում անընդմեջ։',
    'Mars Master': 'Մարսի վարպետ', 'Win with a mars: your opponent bore off nothing.': 'Հաղթիր մարսով․ մրցակիցդ ոչ մի քար չհանի։',
    'Comeback King': 'Վերադարձի արքա', 'Win a game after being 40 or more pips behind.': 'Հաղթիր խաղը՝ 40 կամ ավելի միավորով հետ մնալուց հետո։',
    'Perfect Doubles': 'Կատարյալ զույգեր', 'Roll 6-6 three times in one online game.': 'Գցիր 6-6 երեք անգամ մեկ օնլայն խաղում։',
    'Untouchable': 'Անխոցելի', 'Win short nardi without ever being hit.': 'Հաղթիր կարճ նարդի՝ առանց մեկ անգամ խփվելու։',
    'Speed Player': 'Արագ խաղացող', 'Win a whole online game in under 5 minutes.': 'Հաղթիր ամբողջ օնլայն խաղը 5 րոպեից քիչ ժամանակում։',
    'Both Worlds': 'Երկու աշխարհ', 'Win both short and long nardi (counts the smaller of the two).': 'Հաղթիր և՛ կարճ, և՛ երկար նարդի (հաշվվում է երկուսից փոքրը)։',
    'High Roller': 'Մեծ խաղադրույք', 'Win in the Gold, Diamond and Royal rooms.': 'Հաղթիր Ոսկե, Ադամանդե և Արքայական սեղաններում։',
    'Fortune': 'Հարստություն', 'Coins won in coin rooms, all time.': 'Սեղաններում շահած մետաղադրամներ՝ ընդհանուր։',
    'Royal Victory': 'Արքայական հաղթանակ', 'Win in the Royal 10,000 room. Unlocks the Royal Crown avatar.': 'Հաղթիր Արքայական 10,000 սեղանում։ Բացում է «Արքայական թագ» ավատարը։',
    'Friendly': 'Ընկերասեր', 'Make friends: both of you added each other.': 'Ընկերացիր․ երկուսդ էլ ավելացրել եք միմյանց։',
    'Good Sport': 'Ազնիվ խաղացող', 'Say "Good game!" or "Well played!" to opponents online.': 'Ասա «Լավ խաղ էր!» կամ «Լավ խաղացիր!» օնլայն մրցակիցներին։',
    'Rematch Rival': 'Ռևանշի վարպետ', 'Play rematches.': 'Խաղա ռևանշներ։',
    'Daily Devotion': 'Ամենօրյա նվիրում', 'Complete the full 7-day daily bonus.': 'Հավաքիր ամբողջ 7-օրյա բոնուսը։',
    'Veteran': 'Վետերան', 'Reach a level.': 'Հասիր մակարդակի։',
    'Collector': 'Հավաքորդ', 'Own items from the Shop.': 'Ունեցիր իրեր Խանութից։',
    'Top 10': 'Լավագույն 10', 'Finish a week in the top 10. Unlocks the Golden Laurel frame.': 'Ավարտիր շաբաթը լավագույն 10-ում։ Բացում է «Ոսկե դափնի» շրջանակը։',
    'Number One': 'Առաջին համար', 'Finish a week as number one. Unlocks the Ararat Gold avatar.': 'Ավարտիր շաբաթն առաջին տեղում։ Բացում է «Ոսկե Արարատ» ավատարը։',
    '· {0}': '· {0}', '🏆 {0}': '🏆 {0}', '3D board preview': 'Տախտակի 3D դիտում',
    '{0} · since {1}': '{0} · խաղում է {1}-ից',
  };
  const DICTS = { hy: HY };

  // ---- matching
  const D = DICTS[lang] || null, exact = new Map(), lower = new Map(), pats = [];
  if (D) for (const [k, v] of Object.entries(D)) {
    if (!/\{#?\d\}/.test(k)) { exact.set(k, v); lower.set(k.toLowerCase(), v); continue; }
    const re = '^' + k.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{(#?)\d\}/g, (m, n) => n ? '(\\d[\\d,.]*)' : '([\\s\\S]*?)') + '$';
    pats.push({ re: new RegExp(re), v, lit: k.replace(/\{#?\d\}/g, '').length });
  }
  pats.sort((a, b) => b.lit - a.lit);
  const cache = new Map();
  function core(s, depth) {
    if (exact.has(s)) return exact.get(s);
    for (const p of pats) {
      const m = s.match(p.re); if (!m) continue;
      return p.v.replace(/\{(\d)\}/g, (x, i) => tr(m[+i + 1] || '', depth + 1));
    }
    // an all-caps version of a known text (banners)
    if (/[A-Z]/.test(s) && s === s.toUpperCase() && lower.has(s.toLowerCase())) return lower.get(s.toLowerCase()).toUpperCase();
    return null;
  }
  function tr(s, depth = 0) {
    if (!D || !s || depth > 3 || !/[A-Za-z]/.test(s)) return s;
    if (cache.has(s)) return cache.get(s);
    const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/), r = core(m[2], depth), out = r == null ? s : m[1] + r + m[3];
    if (cache.size > 4000) cache.clear();
    cache.set(s, out); return out;
  }

  // ---- swap text on screen as it appears
  const ATTRS = ['aria-label', 'title', 'placeholder'];
  const skip = el => el && el.closest && el.closest('script, style, textarea, [translate="no"], #errbar');
  function doText(n) { const v = n.nodeValue; if (!v || !/[A-Za-z]/.test(v) || skip(n.parentElement)) return; const t = tr(v); if (t !== v) n.nodeValue = t; }
  function doEl(el) {
    if (skip(el)) return;
    for (const a of ATTRS) { const v = el.getAttribute(a); if (v) { const t = tr(v); if (t !== v) el.setAttribute(a, t); } }
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (n.nodeType === 3) doText(n);
      else for (const a of ATTRS) { const v = n.getAttribute(a); if (v) { const t = tr(v); if (t !== v) n.setAttribute(a, t); } }
    }
  }
  function start() {
    document.documentElement.lang = lang;
    if (!D) return;
    doEl(document.body);
    new MutationObserver(ms => {
      for (const m of ms) {
        if (m.type === 'characterData') doText(m.target);
        else if (m.type === 'attributes') { const v = m.target.getAttribute(m.attributeName); if (v) { const t = tr(v); if (t !== v) m.target.setAttribute(m.attributeName, t); } }
        else for (const n of m.addedNodes) n.nodeType === 3 ? doText(n) : n.nodeType === 1 && doEl(n);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  function set(l) { if (!LANGS[l] || l === lang) return; try { localStorage.setItem(LS, JSON.stringify(l)); } catch {} location.reload(); }

  window.I18N = { lang, LANGS, tr, set, start, locale: { en: 'en-US', hy: 'hy-AM' }[lang] };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
