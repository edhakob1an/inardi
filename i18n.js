// iNardi translations.
// The game is written in English; when another language is on, text is swapped as it appears on screen.
// Keys are the English text exactly as shown. {0}, {1}… stand for any text (numbers, names), in the order they
// appear in the English; {#0} stands for a number only. Captured parts are translated too when they have an entry.
(function () {
  'use strict';
  const LS = 'nardi.lang';
  const LANGS = { en: 'English', hy: 'Հայերեն', ru: 'Русский' };
  let lang = 'en';
  const sys = () => { const l = (navigator.language || '').toLowerCase().slice(0, 2); return LANGS[l] ? l : 'en'; };
  try { const v = JSON.parse(localStorage.getItem(LS)); lang = LANGS[v] ? v : sys(); } catch { lang = sys(); }

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

    'Sevan Night': 'Սևանի գիշեր', 'Midnight-blue lacquer with silver filigree and the Sevanavank monastery above the lake.': 'Կեսգիշերային կապույտ լաք՝ արծաթե ֆիլիգրանով և լճի վրա բարձրացող Սևանավանքով։',
    'Moonstone & Sapphire': 'Լուսնաքար և շափյուղա', 'Milky moonstone against deep sapphire, both with polished silver rims.': 'Կաթնագույն լուսնաքար և մուգ շափյուղա, երկուսն էլ՝ հղկված արծաթե եզրերով։',
    'Silver & Midnight': 'Արծաթ և կեսգիշեր', 'Brushed silver dice with midnight-blue pips and a silver eternity sign.': 'Արծաթե զառեր՝ կեսգիշերային կապույտ կետերով և արծաթե հավերժության նշանով։',
    'Sevanavank': 'Սևանավանք', 'The silver monastery above Lake Sevan, on midnight-blue enamel.': 'Արծաթե վանքը Սևանա լճի վրա՝ կեսգիշերային կապույտ էմալի վրա։',
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
  const RU = {
    // ---- studio, menu
    'presents': 'представляет',
    'Guest': 'Гость', 'Guest {#0}': 'Гость {0}', '{0} (you)': '{0} (ты)',
    'Ready for a game': 'Готов к игре',
    'SHORT': 'КОРОТКИЕ', 'LONG': 'ДЛИННЫЕ',
    'PLAY ONLINE': 'ИГРАТЬ ОНЛАЙН', 'ROOMS FROM 100 COINS': 'СТОЛЫ ОТ 100 МОНЕТ',
    'VS BOT': 'С БОТОМ', 'FRIEND': 'С ДРУГОМ', 'NEW': 'НОВОЕ',
    'Shop': 'Магазин', 'Free coins': 'Бесплатно', 'Friends': 'Друзья', 'Leaders': 'Рейтинг', 'Settings': 'Настройки',
    'Your profile': 'Твой профиль', 'Level': 'Уровень', 'Daily bonus': 'Ежедневный бонус', 'Get coins': 'Получить монеты', 'Get pearls': 'Получить жемчуг',
    'Nardi board': 'Доска для нард', 'Switch between short and long': 'Переключить короткие и длинные', 'Back': 'Назад',
    'Close preview': 'Закрыть просмотр', 'Reset view': 'Сбросить вид', 'Games won': 'Выигранные партии', 'Game menu': 'Меню игры',
    'Send an emoji or phrase': 'Отправить эмодзи или фразу', 'Undo move': 'Отменить ход',
    'Classic rules · hit single checkers': 'Классические правила · можно бить одиночные шашки',
    'No hitting · all 15 start on the head': 'Без боя · все 15 стартуют с головы',

    // ---- rooms
    'Play online': 'Игра онлайн',
    'BRONZE': 'БРОНЗА', 'SILVER': 'СЕРЕБРО', 'GOLD': 'ЗОЛОТО', 'DIAMOND': 'БРИЛЛИАНТ', 'ROYAL': 'КОРОЛЕВСКИЙ',
    'Bronze': 'Бронзовый', 'Silver': 'Серебряный', 'Gold': 'Золотой', 'Diamond': 'Бриллиантовый', 'Royal': 'Королевский',
    'Win {#0}': 'Выигрыш {0}',
    'How rooms work.': 'Как работают столы.',
    'You and your opponent each put in the stake. The winner takes the pot. A mars does not change the prize.': 'Ты и соперник ставите одинаковую ставку. Победитель забирает банк. Марс не меняет выигрыш.',
    'INVITE A FRIEND': 'ПРИГЛАСИТЬ ДРУГА',
    '{0} nardi. Pick a table and we match you with a player at the same stake.': '{0} нарды. Выбери стол, и мы найдём игрока с такой же ставкой.',
    'Short': 'Короткие', 'Long': 'Длинные', '{0} nardi': '{0} нарды', '{0} nardi{1}': '{0} нарды{1}', 'short': 'короткие', 'long': 'длинные',

    // ---- leaderboard
    'Leaderboard': 'Рейтинг', 'WINS': 'Победы', 'COINS WON': 'Выигранные монеты',
    'The leaderboard needs a connection.': 'Для рейтинга нужно подключение.',
    'This week · ends in': 'Эта неделя · до конца',
    '{#0}d {#1}h': '{0} д {1} ч', '{#0}h {#1}m': '{0} ч {1} мин', '{#0}m': '{0} мин',
    '{0} Only coin-room games count.': '{0} Учитываются только игры на монеты.',
    'Top 10 by wins get coins: 1st 5,000 · 2nd 3,000 · 3rd 2,000 · 4th–10th 500.': 'Топ-10 по победам получают монеты: 1-е 5,000 · 2-е 3,000 · 3-е 2,000 · 4–10-е 500.',
    'Coins won in coin rooms this week. Prizes go by the Wins board.': 'Монеты, выигранные за столами на этой неделе. Призы даются по рейтингу побед.',
    'Nobody on the board yet this week.': 'На этой неделе в рейтинге пока никого нет.',
    'Win a game in a coin room to be the first.': 'Выиграй партию за столом на монеты и стань первым.',
    'Win a game in a coin room to join the board.': 'Выиграй партию за столом на монеты, чтобы попасть в рейтинг.',
    '{0} coins won': '{0} монет выиграно', '{#0} win': '{0} победа', '{#0} wins': 'Побед: {0}',
    'Lv {0}': 'Ур. {0}',

    // ---- friends
    'Playing a game': 'Играет', 'Wants to be your friend': 'Хочет дружить', 'Waiting for them to add you back': 'Ждём, когда тебя добавят в ответ',
    'INVITE': 'ПОЗВАТЬ', 'More': 'Ещё', 'ADD BACK': 'ДОБАВИТЬ', 'Remove': 'Удалить', 'Cancel request': 'Отменить заявку',
    'Invites are for {0} nardi. Switch the game on the main menu.': 'Приглашения на {0} нарды. Сменить игру можно в главном меню.',
    'REQUESTS': 'ЗАЯВКИ', 'FRIENDS': 'ДРУЗЬЯ', 'SENT': 'ОТПРАВЛЕННЫЕ',
    'No friends yet.': 'Друзей пока нет.', 'After an online game, tap': 'После онлайн-партии нажми',
    'ADD FRIEND': 'ДОБАВИТЬ В ДРУЗЬЯ',
    'to add your opponent. When they add you back, you can see when they are online and invite them with one tap.': ', чтобы добавить соперника. Когда он добавит тебя в ответ, ты увидишь, когда он онлайн, и сможешь позвать его одним касанием.',
    'Friends need a connection.': 'Для друзей нужно подключение.',
    'Remove friend': 'Удалить из друзей', 'You and {0} are friends': 'Вы с {0} друзья',
    'Friends ✓': 'Друзья ✓', 'Friend request sent ✓': 'Заявка отправлена ✓', 'Add back as friend': 'Добавить в друзья в ответ', 'Add friend': 'Добавить в друзья',

    // ---- shop
    'CASES': 'Сундуки', 'BOARDS': 'Доски', 'CHECKERS': 'Шашки', 'DICE': 'Кости', 'AVATARS': 'Аватары', 'FRAMES': 'РАМКИ',
    'Loading 3D…': 'Загрузка 3D…', 'Tap the case to open it': 'Коснись сундука, чтобы открыть',
    'Preview {0} in 3D': '{0} в 3D',
    'Achievement': 'Достижение', '🎁 Gold case only': '🎁 Только из золотого сундука', 'EQUIPPED': 'ВЫБРАНО', 'EQUIP': 'ВЫБРАТЬ',
    'Not enough pearls': 'Не хватает жемчуга', '{0} costs {1} pearls. You have {2}.': '{0} стоит {1} жемчуга. У тебя {2}.',
    'GET PEARLS': 'ПОЛУЧИТЬ ЖЕМЧУГ', 'BUY AND EQUIP': 'КУПИТЬ И ВЫБРАТЬ', 'Cancel': 'Отмена',
    'Tap to flip · Drag to turn · Pinch to zoom': 'Коснись — перевернуть · Тяни — вращать · Щипок — масштаб',
    'Tap to roll · Drag to turn · Pinch to zoom': 'Коснись — бросить · Тяни — вращать · Щипок — масштаб',
    'Drag to turn · Pinch to zoom · Tap to close': 'Тяни — вращать · Щипок — масштаб · Коснись — закрыть',
    'Could not open the 3D preview': 'Не удалось открыть 3D-просмотр',
    'Preview': 'Тестовая версия',
    'Pearls buy boards, checkers, dice, avatars, frames and cases.': 'За жемчуг покупаются доски, шашки, кости, аватары, рамки и сундуки.',
    'In this preview, packs are added free. Real prices come with Google Play billing.': 'В тестовой версии наборы начисляются бесплатно. Настоящие цены появятся с оплатой через Google Play.',
    'Watch an ad · +50': 'Смотреть рекламу · +50',
    '{0} is yours': '{0} — теперь твоё',
    'board': 'доска', 'checker set': 'набор шашек', 'dice set': 'набор костей', 'avatar': 'аватар', 'frame': 'рамка',

    'Sevan Night': 'Ночь Севана', 'Midnight-blue lacquer with silver filigree and the Sevanavank monastery above the lake.': 'Полуночно-синий лак с серебряной филигранью и монастырём Севанаванк над озером.',
    'Moonstone & Sapphire': 'Лунный камень и сапфир', 'Milky moonstone against deep sapphire, both with polished silver rims.': 'Молочный лунный камень и глубокий сапфир, оба с полированными серебряными ободками.',
    'Silver & Midnight': 'Серебро и полночь', 'Brushed silver dice with midnight-blue pips and a silver eternity sign.': 'Кости из матового серебра с полуночно-синими точками и серебряным знаком вечности.',
    'Sevanavank': 'Севанаванк', 'The silver monastery above Lake Sevan, on midnight-blue enamel.': 'Серебряный монастырь над озером Севан на полуночно-синей эмали.',
    // items: boards
    'Ararat Walnut': 'Араратский орех', 'Carved vines and pomegranates with Mount Ararat medallions.': 'Резная лоза и гранаты с медальонами горы Арарат.',
    'Golden Oak': 'Золотой дуб', 'Light oak, apricot-wood inlay and carved pomegranate branches.': 'Светлый дуб, инкрустация абрикосовым деревом и резные гранатовые ветви.',
    'Pearl Ebony': 'Жемчужное эбеновое', 'Black ebony inlaid with mother-of-pearl and gold.': 'Чёрное эбеновое дерево с перламутром и золотом.',
    'Pink Tuff': 'Розовый туф', 'The rose-pink stone of Yerevan, carved lace and a black basalt bar.': 'Розовый камень Еревана, резное кружево и чёрная базальтовая перегородка.',
    'Royal Garnet': 'Королевский гранат', 'Garnet-red cherry under glossy lacquer, with gold-leaf lines and a golden pomegranate tree.': 'Гранатово-красная вишня под глянцевым лаком, с линиями сусального золота и золотым гранатовым деревом.',
    // checkers
    'Ivory & Mahogany': 'Слоновая кость и махагон', 'The classic pair. Polished ivory and red mahogany.': 'Классическая пара. Полированная слоновая кость и красный махагон.',
    'Bone & Walnut': 'Кость и орех', 'Cream bone with a walnut rim, and dark walnut.': 'Кремовая кость с ореховым ободком и тёмный орех.',
    'Pearl & Garnet': 'Жемчуг и гранат', 'Mother-of-pearl and garnet lacquer, gold rims.': 'Перламутр и гранатовый лак, золотые ободки.',
    'Tuff & Basalt': 'Туф и базальт', 'Rose-pink tuff against polished black basalt, two Armenian stones.': 'Розовый туф и полированный чёрный базальт — два армянских камня.',
    'Amber & Onyx': 'Янтарь и оникс', 'Honey amber against black onyx, both with thin gold rims.': 'Медовый янтарь и чёрный оникс, оба с тонкими золотыми ободками.',
    // dice
    'Bronze Ivory': 'Бронзовая кость', 'Ivory dice, dark pips and a bronze eternity sign on the one.': 'Кости из слоновой кости, тёмные точки и бронзовый знак вечности на единице.',
    'Walnut & Bone': 'Орех и кость', 'Dark walnut dice with bone pips and a carved bone eternity sign.': 'Кости из тёмного ореха с костяными точками и резным знаком вечности.',
    'Pearl & Gold': 'Жемчуг и золото', 'Mother-of-pearl dice with gold pips and a gold eternity sign.': 'Перламутровые кости с золотыми точками и золотым знаком вечности.',
    'Obsidian & Gold': 'Обсидиан и золото', 'Black Armenian obsidian with gold pips and a gold eternity sign.': 'Чёрный армянский обсидиан с золотыми точками и золотым знаком вечности.',
    'Lapis & Silver': 'Лазурит и серебро', 'Deep blue lapis lazuli with gold flecks, silver pips and a silver eternity sign.': 'Тёмно-синий лазурит с золотыми вкраплениями, серебряными точками и серебряным знаком вечности.',
    // avatars
    'Your checker': 'Твоя шашка', 'Your light checker, whatever set you play with.': 'Твоя светлая шашка из того набора, которым ты играешь.',
    'Mount Ararat': 'Гора Арарат', 'The carved Ararat medallion of the walnut board.': 'Резной медальон с Араратом с ореховой доски.',
    'Pomegranate': 'Гранат', 'Carved pomegranate branches in light oak.': 'Резные гранатовые ветви из светлого дуба.',
    'Pearl Star': 'Жемчужная звезда', 'The mother-of-pearl star of the ebony board.': 'Перламутровая звезда с эбеновой доски.',
    'Eternity Stone': 'Камень вечности', 'The eternity sign carved in pink tuff.': 'Знак вечности, вырезанный в розовом туфе.',
    'Golden Branch': 'Золотая ветвь', 'A gold-leaf pomegranate branch on garnet lacquer.': 'Гранатовая ветвь из сусального золота на гранатовом лаке.',
    'Gold Eternity': 'Золотая вечность', 'A polished gold eternity sign on black obsidian.': 'Полированный золотой знак вечности на чёрном обсидиане.',
    'Black Pearl': 'Чёрная жемчужина', 'A lustrous pearl on black silk. Only from Gold cases.': 'Сияющая жемчужина на чёрном шёлке. Только из золотых сундуков.',
    'Royal Crown': 'Королевская корона', 'Only for winners of the Royal 10,000 room.': 'Только для победителей Королевского стола 10,000.',
    'Ararat Gold': 'Золотой Арарат', 'Only for players who finished a week as number one.': 'Только для тех, кто закончил неделю на первом месте.',
    'Silver Eternity': 'Серебряная вечность', 'A polished silver eternity sign on deep lapis.': 'Полированный серебряный знак вечности на тёмном лазурите.',
    // frames
    'No frame': 'Без рамки', 'A simple thin line.': 'Простая тонкая линия.',
    'A warm bronze ring.': 'Тёплое бронзовое кольцо.', 'A bright polished silver ring.': 'Яркое полированное серебряное кольцо.', 'A glowing gold ring.': 'Сияющее золотое кольцо.',
    'Garnet': 'Гранат', 'Deep red garnet with a gold edge.': 'Тёмно-красный гранат с золотым краем.',
    'Lapis': 'Лазурит', 'Royal blue lapis with a gold edge.': 'Королевский синий лазурит с золотым краем.',
    'A turning ring of diamond light. The rarest frame you can buy.': 'Вращающееся кольцо бриллиантового света. Самая редкая рамка в магазине.',
    'Pearl String': 'Жемчужная нить', 'A ring of real pearls. Only from Gold cases.': 'Кольцо из настоящего жемчуга. Только из золотых сундуков.',
    'Golden Laurel': 'Золотой лавр', 'Only for players who finished a week in the top 10.': 'Только для тех, кто закончил неделю в топ-10.',

    // ---- cases
    'Bronze case': 'Бронзовый сундук', 'Silver case': 'Серебряный сундук', 'Gold case': 'Золотой сундук',
    'Coins and pearls, sometimes a dice or checker set.': 'Монеты и жемчуг, иногда набор костей или шашек.',
    'Bigger prizes and a chance at a board or frame.': 'Призы крупнее и шанс получить доску или рамку.',
    'The best prizes, and the only way to get legendary items.': 'Лучшие призы и единственный способ получить легендарные предметы.',
    'Common': 'Обычный', 'Rare': 'Редкий', 'Epic': 'Эпический', 'Legendary': 'Легендарный',
    'Cases need a connection.': 'Для сундуков нужно подключение.',
    'Free daily case': 'Бесплатный сундук дня', 'A Bronze case, free every day.': 'Бронзовый сундук, бесплатно каждый день.',
    'CLAIM': 'ЗАБРАТЬ', 'OPEN': 'ОТКРЫТЬ', 'Chances': 'Шансы',
    'You also get cases from level-ups (Silver every 5th level) and from the weekly leaderboard. Items you already own turn into pearls.': 'Сундуки также дают за новые уровни (серебряный — каждый 5-й уровень) и за недельный рейтинг. Предметы, которые у тебя уже есть, превращаются в жемчуг.',
    '{0} coins': '{0} монет', '{0} pearls': '{0} жемчуга',
    'Rare: a dice or checker set': 'Редкий: набор костей или шашек',
    'Epic: a board, frame or premium avatar': 'Эпический: доска, рамка или премиум-аватар',
    'Legendary: case-only Black Pearl avatar, Pearl String frame or Diamond frame': 'Легендарный: только из сундуков — аватар «Чёрная жемчужина», рамка «Жемчужная нить» или «Бриллиант»',
    'Chances for each opening': 'Шансы при каждом открытии',
    'If you already own the item, you get pearls instead: Rare 30, Epic 80, Legendary 200.': 'Если предмет уже есть, вместо него дают жемчуг: редкий 30, эпический 80, легендарный 200.',
    'Free Bronze case added': 'Бесплатный бронзовый сундук добавлен',
    'You already have it, so you get {0} pearls instead.': 'Он у тебя уже есть, поэтому вместо него ты получаешь {0} жемчуга.',
    'New {0}. Equip it in the Shop.': 'Новая вещь: {0}. Выбери её в магазине.',
    'Added to your balance.': 'Добавлено на твой счёт.', 'Open another ({0})': 'Открыть ещё ({0})', 'COLLECT': 'ЗАБРАТЬ',

    // ---- bot / friend / ad / settings sheets
    'Play the bot': 'Игра с ботом', '{0} nardi, no coins at stake.': '{0} нарды, без ставки.',
    'Easy': 'Лёгкий', 'Relaxed. Makes mistakes.': 'Расслабленный. Ошибается.', 'Hard': 'Сложный', 'Plays to win.': 'Играет на победу.',
    'Play a friend': 'Игра с другом', 'Invite online': 'Пригласить онлайн', 'Send a link or a code': 'Отправь ссылку или код',
    'Join with a code': 'Войти по коду', 'Enter your friend’s 6-letter code': 'Введи 6-значный код друга',
    'Two players, one phone': 'Двое на одном телефоне', 'Pass and play, side by side': 'Играйте по очереди, сидя рядом',
    'Not enough coins': 'Не хватает монет', 'The {0} table needs {1} coins. You have {2}.': 'Для стола «{0}» нужно {1} монет. У тебя {2}.',
    'WATCH AD · +50': 'СМОТРЕТЬ РЕКЛАМУ · +50', 'Watch a short video and get 50 coins.': 'Посмотри короткое видео и получи 50 монет.',
    'In this preview the ad is skipped and the coins are added straight away.': 'В тестовой версии реклама пропускается, и монеты начисляются сразу.',
    'Not now': 'Не сейчас', 'GET COINS': 'ПОЛУЧИТЬ МОНЕТЫ',
    'Change your avatar and frame in the Shop.': 'Аватар и рамку можно сменить в магазине.',
    'How to play': 'Как играть', 'Rules of short and long nardi': 'Правила коротких и длинных нард',
    'Music': 'Музыка', 'Sounds': 'Звуки', 'Close': 'Закрыть',
    'Language': 'Язык', 'Choose the language of the game': 'Выбери язык игры',

    // ---- game screen
    'Bot': 'Бот', 'You': 'Ты', 'Player': 'Игрок', 'A player': 'Игрок', 'Light': 'Светлые', 'Dark': 'Тёмные', 'LIGHT': 'СВЕТЛЫЕ', 'DARK': 'ТЁМНЫЕ',
    'Bot · Easy': 'Бот · Лёгкий', 'Bot · Hard': 'Бот · Сложный',
    'ROLL': 'БРОСОК', 'ROLL · {0}': 'БРОСОК · {0}',
    'Auto-roll': 'Автобросок', 'Roll the dice automatically when your turn starts.': 'Кости бросаются сами, когда начинается твой ход.',
    'ON': 'ВКЛ', 'OFF': 'ВЫКЛ',
    '{0} pips · {1} off': '{0} очков · {1} снято',
    '{#0} move left': 'Осталось ходов: {0}', '{#0} moves left': 'Осталось ходов: {0}',
    'Sending…': 'Отправка…', 'Game over': 'Партия окончена', 'Deciding first move': 'Кто ходит первым',
    'Rolling…': 'Бросает…', 'Their turn': 'Ход соперника', 'Bot is thinking': 'Бот думает',
    'No legal moves': 'Нет возможных ходов', '{0} has no moves': '{0}: нет ходов',
    '{0} starts': 'Начинает: {0}', 'You start': 'Ты начинаешь', 'Bot starts': 'Начинает бот',
    'Resume': 'Продолжить', 'Resign': 'Сдаться', 'Restart game': 'Начать заново',
    "Opponent's messages: {0}": 'Сообщения соперника: {0}', 'hidden': 'скрыты', 'shown': 'видны',
    'Finish this game first': 'Сначала закончи эту партию',
    // rules
    'Both games:': 'В обеих играх:', 'Short:': 'Короткие:', 'Long:': 'Длинные:', 'Got it': 'Понятно',
    'roll, then move checkers by each die. You must use both dice if you can; if only one can be played, you must play the larger. Doubles are played four times. Bring all 15 into your home quarter, then bear them off. If the opponent bore off none, it is a mars and counts double.':
      'брось кости и передвинь шашки на число каждой кости. Нужно сыграть обе кости, если это возможно; если можно сыграть только одну — играется бóльшая. Дубль играется четыре раза. Приведи все 15 шашек в свой дом, затем выбрасывай их. Если соперник не выбросил ни одной, это марс, и партия считается двойной.',
    'you move opposite to your opponent. A single checker is a blot; landing on it sends it to the bar, and it must re-enter before anything else moves. Two or more checkers hold a point.':
      'ты ходишь навстречу сопернику. Одиночная шашка уязвима: если на неё встать, она уходит на бар и должна вернуться в игру раньше любых других ходов. Две и более шашки держат пункт.',
    'both sides move the same way, starting from the head. No hitting: you cannot land on any point the opponent holds. Only one checker leaves the head per turn, except a first roll of 6-6, 4-4 or 3-3. You may not build a wall of six points unless an opponent checker is already past it.':
      'обе стороны ходят в одном направлении, начиная с головы. Бить нельзя: нельзя вставать на пункт, занятый соперником. За ход с головы снимается только одна шашка, кроме первого броска 6-6, 4-4 или 3-3. Нельзя строить забор из шести пунктов, если ни одна шашка соперника ещё не прошла его.',
    // end of game
    'MARS · DOUBLE WIN': 'МАРС · ДВОЙНАЯ ПОБЕДА', 'MARS!': 'МАРС!', 'DOUBLE WIN': 'ДВОЙНАЯ ПОБЕДА', 'YOU WIN': 'ТЫ ПОБЕДИЛ', '{0} WINS': 'ПОБЕДИЛИ {0}',
    '{0} wins': 'Победа: {0}', 'You win': 'Ты победил', 'Bot wins': 'Бот победил', 'You lose': 'Ты проиграл',
    'Mars: the other side bore off nothing, so this game counts double.': 'Марс: соперник не выбросил ни одной шашки, поэтому партия считается двойной.',
    'A clean win.': 'Чистая победа.', 'PLAY AGAIN': 'ЕЩЁ РАЗ', 'Main menu': 'Главное меню',
    '{0} resigned.': '{0} сдался.', 'You resigned.': 'Ты сдался.', '{0} ran out of time.': 'У игрока {0} вышло время.', 'You ran out of time.': 'У тебя вышло время.',
    'Mars: no checkers were borne off by the loser.': 'Марс: проигравший не выбросил ни одной шашки.', 'All fifteen checkers borne off.': 'Все пятнадцать шашек выброшены.',
    'New opponent': 'Новый соперник', 'REMATCH': 'РЕВАНШ', '+{0} COINS': '+{0} МОНЕТ',
    '+50 coins': '+50 монет', '+{0} coins': '+{0} монет', '+{0} pearls': '+{0} жемчуга',
    // quick chat
    'Hi!': 'Привет!', 'Good luck!': 'Удачи!', 'Nice move!': 'Хороший ход!', 'Lucky roll!': 'Повезло!', 'Wow!': 'Ого!', 'Oops!': 'Упс!',
    'Hurry up!': 'Поторопись!', 'Thanks!': 'Спасибо!', 'Well played!': 'Хорошо сыграно!', 'Good game!': 'Хорошая игра!', 'Hehe': 'Хе-хе', 'Thinking…': 'Думаю…',

    // ---- online
    'Not done': 'Не получилось', 'Online play': 'Игра онлайн',
    'Online games need the published iNardi app or website. Bot games and two players on one phone still work.': 'Для онлайн-игры нужно приложение или сайт iNardi. Игра с ботом и вдвоём на одном телефоне работают и так.',
    'TRY AGAIN': 'ПОВТОРИТЬ',
    '{0} table': 'Стол «{0}»', '{0} nardi · stake {1} · winner takes {2}': '{0} нарды · ставка {1} · победитель забирает {2}',
    'Looking for an opponent…': 'Ищем соперника…', 'Looking for an opponent… {#0}s': 'Ищем соперника… {0} с',
    'A player is waiting at': 'Игрок ждёт за столом', '· {0} nardi': '· {0} нарды', 'JOIN THEM': 'ПРИСОЕДИНИТЬСЯ',
    'Invite a friend': 'Пригласить друга', 'They are online now.': 'Сейчас в сети.',
    'They are offline right now. They will see the invite if they open iNardi in the next 10 minutes.': 'Сейчас не в сети. Увидит приглашение, если откроет iNardi в ближайшие 10 минут.',
    'Invite sent': 'Приглашение отправлено', 'Waiting for': 'Ждём, пока', 'to accept a game of {0} nardi…': 'примет игру в {0} нарды…', 'to accept…': 'примет…',
    'Cancel invite': 'Отменить приглашение', 'SHARE LINK': 'ПОДЕЛИТЬСЯ', 'COPY LINK': 'КОПИРОВАТЬ ССЫЛКУ',
    '{0} nardi. Send this code or link. The game starts when your friend joins.': '{0} нарды. Отправь этот код или ссылку. Игра начнётся, когда друг присоединится.',
    'Waiting for your friend…': 'Ждём друга…', 'No game': 'Игры не будет', 'Invite expired': 'Приглашение истекло',
    '{0} said no, or the invite expired.': '{0} отказался, или приглашение истекло.',
    'Join a friend': 'Присоединиться к другу', 'Enter the 6-letter code from your friend.': 'Введи 6-значный код от друга.',
    'JOIN GAME': 'ВОЙТИ В ИГРУ', 'Invite code': 'Код приглашения', 'Joining…': 'Подключаемся…', 'The code has 6 letters and numbers.': 'Код состоит из 6 букв и цифр.',
    'Play nardi with me on iNardi! Code {0}': 'Сыграй со мной в нарды в iNardi! Код {0}',
    'Link copied': 'Ссылка скопирована', 'Copy the link above': 'Скопируй ссылку выше',
    'You lose your {0} coin stake.': 'Ты потеряешь ставку в {0} монет.', 'Your opponent wins this game.': 'Соперник выиграет эту партию.',
    'Resign?': 'Сдаться?', 'RESIGN': 'СДАТЬСЯ', 'Keep playing': 'Играть дальше',
    'Name saved': 'Имя сохранено', 'Connected': 'Подключено', 'UPDATE': 'ОБНОВИТЬ',
    'Your name': 'Твоё имя', 'SAVE': 'СОХРАНИТЬ', 'Change name': 'Сменить имя',
    '· stake {0} coins': '· ставка {0} монет', 'Rematch?': 'Реванш?', '{0} wants to play again.': '{0} хочет сыграть ещё.',
    'No thanks': 'Нет, спасибо', 'Game invite': 'Приглашение в игру', '{0} invites you to a game of {1} nardi.': '{0} зовёт тебя сыграть в {1} нарды.', 'PLAY': 'ИГРАТЬ',
    'The invite was cancelled': 'Приглашение отменено', 'Rematch': 'Реванш', 'The request stays open for 10 minutes.': 'Запрос действует 10 минут.',
    'No rematch': 'Реванша не будет', '{0} said no or has left.': '{0} отказался или вышел.',
    // server errors
    'Not enough coins for this table.': 'Для этого стола не хватает монет.', 'You already have a game in progress.': 'У тебя уже идёт партия.',
    'That code is not valid any more.': 'Этот код больше не действует.', 'That is your own invite. Send it to a friend.': 'Это твоё собственное приглашение. Отправь его другу.',
    'Use 2–16 letters or numbers.': 'Используй от 2 до 16 букв или цифр.', 'Please wait a moment before the next reward.': 'Подожди немного до следующей награды.',
    'No connection to the server. Check your internet.': 'Нет связи с сервером. Проверь интернет.', 'That game is not over yet.': 'Эта партия ещё не закончена.',
    'Your opponent has left.': 'Соперник вышел.', 'Your opponent is already playing another game.': 'Соперник уже играет другую партию.',
    'Your opponent does not have enough coins for this stake.': 'У соперника не хватает монет для этой ставки.',
    'You can add players after you have played a game together.': 'Добавить игрока можно после совместной партии.',
    'You can only invite friends who added you back.': 'Звать можно только друзей, которые добавили тебя в ответ.',
    'Your friends list is full.': 'Список друзей заполнен.', 'You already took today’s bonus.': 'Сегодняшний бонус уже получен.',
    'The game changed. Syncing…': 'Партия изменилась. Синхронизация…', 'That move was refused. Syncing…': 'Ход отклонён. Синхронизация…',
    'Something went wrong ({0}).': 'Что-то пошло не так ({0}).',

    // ---- daily, levels, profile, prizes
    'Day {0}': 'День {0}',
    'Day {0} of 7. Come back every day: the reward grows, and day 7 pays {1}. Miss a day and it starts again from day 1.': 'День {0} из 7. Заходи каждый день: награда растёт, а на 7-й день — {1}. Пропустишь день — всё начнётся с первого.',
    'You already took today’s bonus. Come back tomorrow for the next one.': 'Сегодняшний бонус уже получен. Возвращайся завтра за следующим.',
    'CLAIM {0}': 'ЗАБРАТЬ {0}', 'Later': 'Позже', 'GREAT': 'ОТЛИЧНО', 'Day {0} bonus. See you tomorrow!': 'Бонус дня {0}. До завтра!',
    'Level up! You are now level {0}': 'Новый уровень! Теперь у тебя {0}-й уровень', '+{0} coins · {1} case': '+{0} монет · {1} сундук',
    'Level {0}': 'Уровень {0}', 'LEVEL': 'УРОВЕНЬ', 'LEVEL {0}': 'УРОВЕНЬ {0}',
    'Online games': 'Онлайн-партии', 'Wins': 'Победы', 'Win rate': 'Процент побед', 'Best streak{0}': 'Лучшая серия{0}', '· now {0}': '· сейчас {0}',
    'Mars wins': 'Победы марсом', 'Coins won': 'Выиграно монет', 'Against the bot': 'Против бота',
    'Against the bot: {0} wins of {1} games': 'Против бота: {0} побед из {1} партий', '{0} wins of {1}': '{0} побед из {1}',
    'Online': 'В сети', 'Offline': 'Не в сети', '· since {0}': '· с {0}', '{0} · since {1}': '{0} · играет с {1}', '· next level pays {0} coins': '· следующий уровень даст {0} монет',
    'Weekly prize': 'Недельный приз', 'You finished': 'Ты занял', 'on last week’s leaderboard.': 'место в рейтинге прошлой недели.',
    // achievements
    'Achievements': 'Достижения', '’s achievements': ': достижения', '{0} of {1} earned': 'Получено {0} из {1}', '{0} / {1} tiers': '{0} / {1} ступеней',
    '{0} · next tier': '{0} · следующая ступень', 'Progress': 'Прогресс', 'Completed': 'Выполнено', 'Achievements need a connection.': 'Для достижений нужно подключение.',
    'ACHIEVEMENT{0}': 'ДОСТИЖЕНИЕ{0}', 'New {0} unlocked: {1}': 'Открыт новый предмет ({0}): {1}',
    'First Blood': 'Первая кровь', 'Win your first online game.': 'Выиграй первую онлайн-партию.',
    'Champion': 'Чемпион', 'Win online games.': 'Побеждай в онлайн-партиях.',
    'Hot Streak': 'Горячая серия', 'Win online games in a row.': 'Выигрывай онлайн-партии подряд.',
    'Mars Master': 'Мастер марса', 'Win with a mars: your opponent bore off nothing.': 'Победи марсом: соперник не выбросил ни одной шашки.',
    'Comeback King': 'Король камбэков', 'Win a game after being 40 or more pips behind.': 'Выиграй партию, отставая на 40 и более очков.',
    'Perfect Doubles': 'Идеальные дубли', 'Roll 6-6 three times in one online game.': 'Выброси 6-6 три раза за одну онлайн-партию.',
    'Untouchable': 'Неприкасаемый', 'Win short nardi without ever being hit.': 'Выиграй короткие нарды, ни разу не попав под бой.',
    'Speed Player': 'Скоростной игрок', 'Win a whole online game in under 5 minutes.': 'Выиграй онлайн-партию меньше чем за 5 минут.',
    'Both Worlds': 'Два мира', 'Win both short and long nardi (counts the smaller of the two).': 'Побеждай и в коротких, и в длинных нардах (считается меньшее из двух).',
    'High Roller': 'Хайроллер', 'Win in the Gold, Diamond and Royal rooms.': 'Победи за Золотым, Бриллиантовым и Королевским столами.',
    'Fortune': 'Состояние', 'Coins won in coin rooms, all time.': 'Монеты, выигранные за столами, за всё время.',
    'Royal Victory': 'Королевская победа', 'Win in the Royal 10,000 room. Unlocks the Royal Crown avatar.': 'Победи за Королевским столом 10,000. Открывает аватар «Королевская корона».',
    'Friendly': 'Дружелюбный', 'Make friends: both of you added each other.': 'Заводи друзей: вы оба добавили друг друга.',
    'Good Sport': 'Честный игрок', 'Say "Good game!" or "Well played!" to opponents online.': 'Говори «Хорошая игра!» или «Хорошо сыграно!» соперникам онлайн.',
    'Rematch Rival': 'Мастер реванша', 'Play rematches.': 'Играй реванши.',
    'Daily Devotion': 'Верность', 'Complete the full 7-day daily bonus.': 'Собери полный 7-дневный бонус.',
    'Veteran': 'Ветеран', 'Reach a level.': 'Достигни уровня.',
    'Collector': 'Коллекционер', 'Own items from the Shop.': 'Собери предметы из магазина.',
    'Top 10': 'Топ-10', 'Finish a week in the top 10. Unlocks the Golden Laurel frame.': 'Закончи неделю в топ-10. Открывает рамку «Золотой лавр».',
    'Number One': 'Номер один', 'Finish a week as number one. Unlocks the Ararat Gold avatar.': 'Закончи неделю на первом месте. Открывает аватар «Золотой Арарат».',
    '· {0}': '· {0}', '🏆 {0}': '🏆 {0}', '3D board preview': '3D-просмотр доски',
  };
  const DICTS = { hy: HY, ru: RU };

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

  window.I18N = { lang, LANGS, tr, set, start, locale: { en: 'en-US', hy: 'hy-AM', ru: 'ru-RU' }[lang] };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
