// Phrases du bot : français, humour bon enfant, mèmes et références (certaines en anglais)
const pick = (list) => list[Math.floor(Math.random() * list.length)];

const recruitment = [
  "🔎 Recherche **désespérément** un 5ème. Profil : respire, a une souris, accepte de se faire appeler « mon reuf ».",
  "📣 Une party Valo se forme ! Niveau exigé : savoir où est la touche pour acheter. Même ça, on peut négocier.",
  "🪖 Jett veut dash, Sage veut rez, et personne ne veut être Sentinelle. On a besoin de vous.",
  "🍿 La soirée est offerte, la défaite est en option. Venez, c'est gratuit.",
  "🎲 Ce soir on tente un truc fou : jouer ensemble ET s'écouter en vocal. (Spoiler : on y arrivera pas.)",
  "🐣 « Je lance une partie, 10 minutes max » — dernières paroles célèbres, il est déjà 3h du matin."
];

const joined = [
  "{name} a rejoint la squad ! Le niveau moyen vient de monter. Ou de descendre. On verra. 🎲",
  "{name} débarque ! Quelqu'un lui dit où est le point de spawn ? 🧭",
  "Un {name} sauvage apparaît ! Il avait promis de pas jouer Reyna. 🦇",
  "{name} est dans la place. Les gars, planquez les snacks. 🍪",
  "{name} rejoint la party et jure qu'il joue « pour le fun ». On connaît la chanson. 🎶"
];

const locked = [
  "⏳ **Deadline passée**, mais les retardataires sont acceptés jusqu'au début du match. On est cools, on est une famille. 🐌",
  "⏳ **Votes fermés**... enfin « fermés », la porte est juste entrouverte. Tu peux encore voter. 🚪"
];

const lockedSquad = [
  "Squad prête ! Respirez, hydratez-vous, et pas de « c'est la faute du ping » avant le round 3 : {mentions}",
  "Squad bouclée ! Que la force (et le wifi) soit avec vous : {mentions}",
  "C'est parti ! Rappel : l'ult de Sage se garde pour quelqu'un qui est encore vivant : {mentions}"
];

const cancelled = [
  "🛑 **Session annulée** par {who}. Les chaises sont remises, le canapé reprend ses droits. 🛋️",
  "🛑 **Annulé** par {who}. Valo, ce sera pour une autre fois. Le frigo, lui, n'attendra pas. 🧊"
];

const flopTitles = [
  "🪑 Flop : la salle est vide",
  "🦗 Ambiance cricket",
  "🫥 Mais... il y a quelqu'un ?"
];

const flopLines = [
  "Seulement **{n}/{size}** présents. Les autres sont sûrement « en route ». Depuis 2019. 🚗",
  "**{n}/{size}** joueurs : c'est plus une party, c'est une réunion de copropriété. 📋",
  "**{n}/{size}** ! On aurait plus vite rempli un ascenseur en panne. 🛗",
  "Il manque du monde (**{n}/{size}**). Ils ont dû tomber sur une promo Steam. 🛒"
];

const reminders = [
  "Le match commence dans **{label}** ! C'est le moment de faire semblant d'avoir fini de manger. 🍝",
  "Plus que **{label}** ! Ton « j'arrive » de tout à l'heure, il est où ? 🚶",
  "**{label}** avant la game. Va chercher à boire, passe aux toilettes, et reviens. On t'attend. 🥤",
  "**{label}** avant le match ! Ceux qui n'ont pas voté : on voit que vous êtes là, hein. 👀"
];

const statsBefore = [
  "Photo avant la game ! On regardera ça après pour pleurer ensemble. 📸",
  "Le point de départ est posé. Les chiffres sont comme les cookies : on en veut plus à la fin. 🍪",
  "État des lieux avant le carnage. Que ceux qui montent lèvent la main (ils sont vraiment très peu). 🙋"
];

const statsAfter = [
  "Voici le bilan ! Toute ressemblance avec un bon niveau serait purement fortuite. 🧾",
  "Les chiffres sont tombés. Mention spéciale à celui qui dira « c'était un bon lobby ». 🎤",
  "Le bilan est là. Pour les réclamations, merci de remplir le formulaire 404. 📮"
];

const mvp = [
  "👑 MVP de la soirée : {name} avec **{acs} ACS**. Les autres peuvent applaudir, c'est gratuit. 👏",
  "👑 {name} a porté la squad avec **{acs} ACS**. Prévoir un massage du dos. 💆",
  "👑 {name} (**{acs} ACS**) a clairement installé un deuxième cerveau. 🧠"
];

const boulet = [
  "🥔 Mention « patate douce » : {name} (**{acs} ACS**). Il a fait de la figuration, et avec talent. 🎭",
  "🥔 {name} ferme la marche avec **{acs} ACS**. Il était sûrement en train de visiter la map. 🗺️",
  "🥔 {name} (**{acs} ACS**) : « C'est pas moi, c'est la souris. » 🖱️"
];

const voteAck = {
  sure: "🟢 Présent ! Et en plus tu as l'air content, c'est beau. ✨",
  maybe: "🟡 Un « peut-être »... traduction : « je regarde si y'a un truc sur Netflix ». 📺",
  if_last: "🟣 Joker en réserve : le Batman de la squad, on t'appelle si ça brûle. 🦇",
  backup: "🟠 Remplaçant noté ! Garde le téléphone allumé et les crampons à portée de main. ⚽",
  no: "🔴 Non ? Bon, on dira à tes agents que tu es « occupé ». 💼",
  remove: "🗑️ Vote effacé. On n'a rien vu, on n'a rien entendu. 🙈"
};

module.exports = {
  pick,
  recruitment,
  joined,
  locked,
  lockedSquad,
  cancelled,
  flopTitles,
  flopLines,
  reminders,
  statsBefore,
  statsAfter,
  mvp,
  boulet,
  voteAck
};
