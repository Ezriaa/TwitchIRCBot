const tmi = require('tmi.js');
var moment = require('moment');
var mysql = require('mysql');

var con = mysql.createPool({
  host: "zzz",
  user: "zzz",
  password: "zzz",
  database: "zzz"
});

const opts = {
  identity: {
    username: 'zzz',
    password: 'zzz'
  },
  channels: [
    'zzz'
  ]
};

const client = new tmi.client(opts);

client.on('connected', onConnectedHandler);
client.connect();

//Verif de l'heure chaque minute
setInterval(function(){ 
  getTime();
}, 60000); //1minute = 60000

client.on('message', (channel, userstate, message, self) => {

  if(self) return;

  let check = `SELECT * FROM utilisateur WHERE pseudo = '${userstate.username}'`;

  function registerDB () {

      con.query(check, (err, pseu_check) => {

        if(err) throw err;

        if(pseu_check == 0) {
          let insert = `INSERT INTO utilisateur(pseudo,cadeau,cadeau_de,points,victoire,defaite,deminage,chance,demi_encour) VALUES('${userstate.username}',0,'',0,0,0,0,0,0)`;
          con.query(insert);
        }
    });
  }

  registerDB();
  
  var coul = couls();

    //Commande TO
  if(message.toLowerCase() === "!pecher") {

      const num = toTime();

      client.say(channel, `@${userstate.username} a péché. Il/Elle est banni(e) ${num} secondes.`);
      client.timeout(channel, userstate.username, num, "Commande !pecher.")

      .then((data) => { //Ne Pas Toucher.
      }).catch((err) => { //Ne Pas Toucher.
      }); //Ne Pas Toucher.

      console.log(`- ${userstate.username} a utiliser !pecher.`);
  }

  //Commande UwU mdrr
  if(message === "UwU" || message === "Uwu" || message === "uwU" || message === "uwu" || message === "UWU"|| message === "uWu") {

      client.say(channel, `UwU <3`);
      console.log("- Encore un cringer... UwU")
  }    

  //Commande inv -- SQL FINI
  if(message === "!inv") {

    con.query(check, function (err, result, fields) {

      if (err) throw err;

      Object.keys(result).forEach(function(key) { 

        var row = result[key]; 
        
      if(row.cadeau === 0) {

        client.say(channel, "Personne ne t'a envoyé de cadeau. linsa4SAD");
      }
      else { client.say(channel, `Tu as ${row.cadeau} cadeau de la part de ${row.cadeau_de}. linsa4HEART`); }
      });
    });

    console.log(`${userstate.username} a utiliser !inv.`);
  }

  //Commande pts -- SQL FINI
  if(message === "!pts") {

    con.query(check, function (err, result, fields) {

      if (err) throw err;

      Object.keys(result).forEach(function(key) { 

        var row = result[key]; 
        
      if(row.points === 0) {

        client.say(channel, "Tu as aucun point, n'hésite pas à utiliser !chance");
      }
      else { client.say(channel, `Tu as ${row.points} points!`); }
      });
    });
      
    console.log(`${userstate.username} a utiliser !pts.`);
  }

  //Commande canons -- SQL FINI
  if(message === "!canon") {

    let cannon_count = `SELECT * FROM cannon`;

    con.query(cannon_count, function (err, result, fields) {

      if (err) throw err;

      Object.keys(result).forEach(function(key) { 

        var row = result[key]; 
        
      if(row.cooldown === 0) {
        let count = `UPDATE cannon SET count=count+1, cooldown=1`;
        con.query(count);
        client.say(channel, "Linsa a manqué "+row.count+" canons!");
        
        sleep(30000).then(() => {
          let fix = `UPDATE cannon SET cooldown=0`;
          con.query(fix);
        })
      }
      else { return }
      });
    });
      
    console.log(`${userstate.username} a utiliser !canon.`);
  }

  //Commande ks -- SQL FINI
  if(message === "!ks") {

    let ks_count = `SELECT * FROM killsteal`;

    con.query(ks_count, function (err, result, fields) {

      if (err) throw err;

      Object.keys(result).forEach(function(key) { 

        var row = result[key]; 
        
      if(row.cooldown === 0) {
        let count = `UPDATE killsteal SET count=count+1, cooldown=1`;
        con.query(count);
        client.say(channel, "Linsa a volé "+row.count+" kills!");

        sleep(30000).then(() => {
          let fix = `UPDATE killsteal SET cooldown=0`;
          con.query(fix);
        })
      }

      else { return }
      });
    });
      
    console.log(`${userstate.username} a utiliser !ks.`);
  }

  //Commande rate -- SQL FINI
  if(message === "!rate") {

    con.query(check, function (err, result, fields) {

      if (err) throw err;

      Object.keys(result).forEach(function(key) { 

        var row = result[key]; 

        if(row.victoire == 0 && row.defaite == 0) {
          client.say(channel, "Aucun combat a ton actif.");
        }

        else { nb_match=row.victoire+row.defaite; calcul=row.victoire/nb_match*100; client.say(channel, `@${userstate.username} ${row.victoire} Victoires | ${row.defaite} Défaites | `+calcul+'% WR'); }
      });
    });

    console.log(`${userstate.username} a utiliser !rate.`);
  }

  //Commande chance -- SQL FINI
  if(message === "!chance") {

    var num = 1;

    con.query(check, function (err, result, fields) {

      if (err) throw err;

      Object.keys(result).forEach(function(key) { 

        var row = result[key]; 
        
        if(row.chance === 0) {
          if(num === 1) {
            client.say(channel, "Chanceux tu viens de gagner 1 points.");

            let add = `UPDATE utilisateur SET points=points+1, chance=1 WHERE pseudo = '${userstate.username}'`;
            con.query(add);
          }
  
          if(num === 2) {
            client.say(channel, "Perdu! linsa4DEMON");
            let daily = `UPDATE utilisateur SET chance=1 WHERE pseudo = '${userstate.username}'`;
            con.query(daily);
          }
        }

        else { client.say(channel, "Tu ne peux utiliser cette commande qu'une fois par jour."); }

      });
    });

    console.log(`${userstate.username} a utiliser !chance.`);
  }

  //Liste des commandes
  if(message === "!cmd") {

    client.say(channel, "Les commandes : https://bit.ly/3lBPdMY");
    console.log(`${userstate.username} a utiliser !cmd.`);
  }

  //Commande deminage -- SQL FINI
  if(message === "!deminage") {

    con.query(check, function (err, result, fields) {

      if (err) throw err;

      Object.keys(result).forEach(function(key) { 

        var row = result[key]; 
        
        if(row.deminage === 0) {

          client.say(channel, "Tic-tac... La bombe a été amorcée... Choisi vite un fil à couper! (!rouge, !vert, !bleu)");
          let jeu = `UPDATE utilisateur SET demi_encour=1, deminage=1 WHERE pseudo = '${userstate.username}'`;
          con.query(jeu);
        }
        
        else { client.say(channel, "Tu ne peux utiliser cette commande qu'une fois par jour."); }

      });
    });
  }

  con.query(check, function (err, result, fields) {

    if (err) throw err;

    Object.keys(result).forEach(function(key) { 

      var row = result[key]; 
      
      if(row.demi_encour === 1) {
        
        if(message === "!rouge") {

          if(coul === 1) {
            client.say(channel, "Ouf... Tu nous à tous sauvé! Tu viens de gagner un point.");
            let demi = `UPDATE utilisateur SET demi_encour=0, points=points+1 WHERE pseudo = '${userstate.username}'`;
            con.query(demi);
          }
  
          else {
            client.say(channel, "BOOM! Tu as perdu et tué tout le monde.");
            let demi = `UPDATE utilisateur SET demi_encour=0 WHERE pseudo = '${userstate.username}'`;
            con.query(demi);
          }
        }

        if(message === "!vert") {

          if(coul === 2) {
            client.say(channel, "Ouf... Tu nous à tous sauvé! Tu viens de gagner un point.");
            let demi = `UPDATE utilisateur SET demi_encour=0, points=points+1 WHERE pseudo = '${userstate.username}'`;
            con.query(demi);
          }
  
          else {
            client.say(channel, "BOOM! Tu as perdu et tué tout le monde.");
            let demi = `UPDATE utilisateur SET demi_encour=0 WHERE pseudo = '${userstate.username}'`;
            con.query(demi);
          }
        }

        if(message === "!bleu") {

          if(coul === 3) {
            client.say(channel, "Ouf... Tu nous à tous sauvé! Tu viens de gagner un point.");
            let demi = `UPDATE utilisateur SET demi_encour=0, points=points+1 WHERE pseudo = '${userstate.username}'`;
            con.query(demi);
          }
  
          else {
            client.say(channel, "BOOM! Tu as perdu et tué tout le monde.");
            let demi = `UPDATE utilisateur SET demi_encour=0 WHERE pseudo = '${userstate.username}'`;
            con.query(demi);
          }
        }
      }
    });
  });
})


client.on('message', (channel, userstate, message, self) => {


let check = `SELECT * FROM utilisateur WHERE pseudo = '${userstate.username}'`;

  if(self || message[0] !== '!') return;

  //RAJOUTER UNE CONDITION POUR CHAQUE COMMANDE @
  if(message === "!kdo") return;
  if(message === "!ratio") return;
  if(message === "!baston") return;

  let parameters = message.split(' ').filter(n => n);
  let command = parameters.shift().slice(1).toLowerCase();

  //Commande Kdo -- SQL FINI
  if(command === "kdo") {

      var pseudo = parameters[0];
      pseudo = pseudo.slice(1).toLowerCase();

      let check_exist = `SELECT * FROM utilisateur WHERE pseudo = '${pseudo}'`;

      con.query(check_exist, function (err, result, fields) {

        if (err) throw err;
  
        Object.keys(result).forEach(function(key) { 

          var row = result[key]; 

          if(row.cadeau === 0) {
            
            client.say(channel, `${pseudo}, tu as reçu un cadeau de la part de ${userstate.username} ! linsa4GIFT (!ouvrir / !rejet)`);

            let cadeau = `UPDATE utilisateur SET cadeau=1, cadeau_de='${userstate.username}' WHERE pseudo = '${pseudo}'`;
            con.query(cadeau);
    
            console.log(`${userstate.username} a enovyer un cadeau à ${pseudo}.`);
          }

          if(row.cadeau >= 1) {
            client.say(channel, `${pseudo} a déjà un cadeau non ouvert.`)
          }
        })
      })
  }

  //Commande ouvrir
  if(command === "ouvrir") {

    var Emote = ["linsa4Fleur", "linsa4Coeur", "linsa4HEART", "linsa4NEKOLOVE", "linsa4HUG", "linsa4PEW", "linsa4DEAD", "linsa4RAGE", "peepoFinger"];

    var emote = Emote[Math.floor(Math.random()*Emote.length)];

    con.query(check, function (err, result, fields) {

      if (err) throw err;

      Object.keys(result).forEach(function(key) { 

        var row = result[key]; 

        if(row.cadeau === 1) {
          let cadeau = `UPDATE utilisateur SET cadeau=cadeau-1 WHERE pseudo = '${userstate.username}'`;
          con.query(cadeau);
          client.say(channel, emote);

          if(emote === "linsa4PEW" || emote === "linsa4DEAD" || emote === "linsa4RAGE" || emote === "peepoFinger"){

            client.say(channel, `Cadeau empoisonné. linsa4DEMON`);
            console.log(`${userstate.username} a reçu un cadeau empoisonné`);
    
            client.timeout(channel, userstate.username, 10, "Cadeau empoisonné.")
    
            .then((data) => { //Ne Pas Toucher.
            }).catch((err) => { //Ne Pas Toucher.
            }); //Ne Pas Toucher.
          }
        }

        else { client.say(channel, "Tu n'as pas de cadeau. linsa4SAD"); }
      })
    })
  }

  //Command rejet
  if(command === "rejet") {

    con.query(check, function (err, result, fields) {

      if (err) throw err;

      Object.keys(result).forEach(function(key) { 

        var row = result[key]; 

        if(row.cadeau === 1) {
          let cadeau = `UPDATE utilisateur SET cadeau=cadeau-1 WHERE pseudo = '${userstate.username}'`;
          con.query(cadeau);
          client.say(channel, `${userstate.username} a rejeté son cadeau. linsa4SAD`);
          console.log(`- ${userstate.username} a rejeté son cadeau.`);
        }
        else { client.say(channel, "Tu n'as pas de cadeau. linsa4SAD"); }
      })
    })
  }

  //Commande baston
  if(command === "baston") {

    var pseudo = parameters[0];
    pseudo = pseudo.slice(1).toLowerCase();;

    var gagnant = bagarre();

    con.query(check, function (err, result, fields) {

      if (err) throw err;

      Object.keys(result).forEach(function(key) { 

        var row = result[key]; 

        if(gagnant === 1) {
          var win = userstate.username;
  
          let win1 = `UPDATE utilisateur SET victoire=victoire+1 WHERE pseudo = '${userstate.username}'`;
          con.query(win1);

          let def1 = `UPDATE utilisateur SET defaite=defaite+1 WHERE pseudo = '${pseudo}'`;
          con.query(def1);
        }
  
        if(gagnant === 2) {
          var win = pseudo;
  
          let win2 = `UPDATE utilisateur SET victoire=victoire+1 WHERE pseudo = '${pseudo}'`;
          con.query(win2);

          let def2 = `UPDATE utilisateur SET defaite=defaite+1 WHERE pseudo = '${userstate.username}'`;
          con.query(def2);
        }

        client.say(channel, `Une bagarre explose entre ${userstate.username} & ${pseudo} ... linsa4DEAD ${win} en sort vainqueur.`);
        console.log(`${userstate.username} a utiliser !baston.`);
      })
    })
  }

  //Commande ratio
  if(command === "ratio") {

    var pseudo = parameters[0];
    pseudo = pseudo.slice(1).toLowerCase();

    let check_exist = `SELECT * FROM utilisateur WHERE pseudo = '${pseudo}'`;

    con.query(check_exist, function (err, result, fields) {

      if (err) throw err;

      Object.keys(result).forEach(function(key) { 

        var row = result[key]; 

        nb_match=row.victoire+row.defaite; 
        calcul=row.victoire/nb_match*100;

        if(row.victoire == 0 && row.defaite == 0) {
          client.say(channel, "Aucun combat a son actif.");
        }
        else { client.say(channel, `@${pseudo} ${row.victoire} Victoires | ${row.defaite} Défaites | `+calcul+"% WR"); }
      })
    })

    console.log(`- ${userstate.username} a utiliser !ratio.`);
}
});

function toTime () {
  const sides = 600;
  return Math.floor(Math.random() * sides) + 1;
}

function bagarre () {
  const sides = 2;
  return Math.floor(Math.random() * sides) + 1;
}

function couls () {
  const coul = 3;
  return Math.floor(Math.random() * coul) + 1;
}

function chance () {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

const getTime = dateTime => {
  var heure = moment(dateTime).format('HH:mm');

  if(heure == "00:00") {
    let refresh = `UPDATE utilisateur SET deminage=0, chance=0`;
    con.query(refresh);
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function onConnectedHandler (addr, port) {
    console.log(`LF_UwUBot est connecter à ${addr}:${port}`);
}
