var player = new Player(200);
var com = new Com(200);
var audio;

var gameStatus = "new_game";

var playerNameNav;
var playerNameStats;
var playerRefLife;
var playerRefCards;
var playerRefGraveyard;

var comRefLife;
var comRefCards;
var comRefGraveyard;

var playerDeck = [];
var playerHand = [];
var playerGraveyard = [];

var comDeck = [];
var comHand = [];
var comGraveyard = [];

var divCards = [];

var turnPlayer = true;
var playerSetup = false;
var turnCom = false;
var playerSelected = false;
var comSelected = false;
var flipCards = false;
var deleteCardsChoice = false;

var playerChoiceAtribute;
var playerChoice;
var playerChoiceIndex;

var comChoiceAtribute;
var comChoice;
var comChoiceIndex;

var xPlayer = 0;
var xCom = 0;
var playerCanvas;
var playerCanvascontext;
var comCanvas;
var comCanvascontext;
var playerCardsHandArea;

var pageContent;
var playerFront;
var comFront;
var cardFlipPlayer;
var cardFlipCom;
var playerAtribute;
var comAtribute;

var msgGameOver;

$(document).ready(function(){
    audio = document.querySelector('audio');

    playerNameNav = document.querySelector('#player_name_1');
    playerNameStats = document.querySelector('#player_name_2');
    
    pageContent = document.querySelector('#content');
    playerCanvas = document.querySelector('#canvas_player');
    playerCanvasContext = playerCanvas.getContext('2d');
    comCanvas = document.querySelector('#canvas_com');
    comCanvasContext = comCanvas.getContext('2d');

    playerFront = document.querySelector('#playerFront');
    comFront = document.querySelector('#comFront');

    cardFlipPlayer = document.querySelector('#cardFlipPlayer');
    cardFlipCom = document.querySelector('#cardFlipCom');

    playerAtribute = document.querySelector('#player_atribute');
    comAtribute = document.querySelector('#com_atribute');

    playerCardsHandArea = document.querySelector('#player_cards');

    backgroundStage();

    if(verifyDeck(playerDeck) && verifyDeck(comDeck)){
        generatePokemonsDeck(playerDeck);
        generatePokemonsDeck(comDeck);
    }

    referenceCards();
    generateComHand(5);
    generatePlayerHand(5);

    const tick = () => {
        refreshStats();

        if(gameStatus == "init_game"){
            generatePlayerCardsHand();
            animatedCardsHand();
            gameStatus = "in_game";
        }

        audio.addEventListener('canplaytrough', function() {
            audio.play();
            audio.volume = 10.0;
            audio.loop = true;
        });

        if(gameStatus == "in_game"){

            if(turnPlayer){
                if(playerSetup){
                    playerSetup = false;
                    turnPlayer = false;
                    playerCardChoice();
                    playerSelected = true;
                }
            }
            
            if(turnCom){
                turnCom = false;
                comChoice = selectComCardAtribute();
                comCardChoice();
                comSelected = true;
            }

            if(playerSelected){
                playerSelected = false;
                createWindowMesage("você scolheu uma carta!!! Vez do Com!!!", 1, "Ok");
            }

            if(comSelected){
                comSelected = false;
                createWindowMesage("Com escolheu uma carta!!! A batalha vai começar!!!", 2, "Init Battle");
            }

            if(flipCards){
                flipCards = false;
                flipCardChoice();
                initBattle();
                gameStatus = "in_pause";
            }

            if(deleteCardsChoice){
                deleteCardsChoice = false;
                freeCards(cardFlipPlayer, playerFront);
                freeCards(cardFlipCom, comFront);
                flipCardChoice();
                resetAtributesChoice();
                turnPlayer = true;
            }

            verifyPlayerCardsHand();
            verifyComCardsHand();

        }else if(gameStatus == "new_game"){
            createInitialMesage();
            gameStatus = "set_name";
        }else if(gameStatus == "game_over"){
            createGameOverMesage(msgGameOver);
            gameStatus = "in_pause";
        }
        
        setTimeout(tick, 100);
    }
    
    tick();

    window.requestAnimationFrame(draw);
});

function backgroundStage(){
    var content = document.querySelector('#content');
    var stage = Math.round(Math.random() * 5);

    if(stage == 0){
        content.style.background = "url('img/estage/arena_03.jpg')";
    }else if(stage == 1){
        content.style.background = "url('img/estage/arena_04.png')";
    }else if(stage == 2){
        content.style.background = "url('img/estage/arena_05.jpg')";
    }else if(stage == 3){
        content.style.background = "url('img/estage/arena_06.png')";
    }else if(stage == 4){
        content.style.background = "url('img/estage/arena_07.png')";
    }else if(stage == 5){
        content.style.background = "url('img/estage/arena_08.png')";
    }

    content.style.backgroundRepeat= "no-repeat";
    content.style.backgroundAttachment= "fixed";
    content.style.backgroundSize= "cover";
}

function Player(life){
    this.life = life;
    this.cards = 32;
    this.graveyard = 0;
}

function Com(life){
    this.life = life;
    this.cards = 32;
    this.graveyard = 0;
}

function refreshStats(){
    gameOver();
    player.cards = playerDeck.length;
    player.graveyard = playerGraveyard.length;

    com.cards = comDeck.length;
    com.graveyard = comGraveyard.length;

    document.getElementById("playerLife").innerHTML = "Life: "+player.life;
    document.getElementById("playerCards").innerHTML = "Cards: "+player.cards;
    document.getElementById("playerGraveyard").innerHTML = "Graveyard: "+player.graveyard;

    document.getElementById("comLife").innerHTML = "Life: "+com.life;
    document.getElementById("comCards").innerHTML = "Cards: "+com.cards;
    document.getElementById("comGraveyard").innerHTML = "Graveyard: "+com.graveyard;
}

function verifyDeck(deck){
    return deck.length == 0;
}

function generatePokemonsDeck(deck){
    for(let i = 0; i < 32; i++){
        var pokeId = Math.round( (Math.random(10000) * 100) + 1 );
        var pokemonFromApi = getPokemonFromApiById(pokeId);
        var newPokemon = new Pokemon(pokemonFromApi);
        deck.push(newPokemon);
    }
}

function getPokemonFromApiById(pokeId){
    const api = "https://pokeapi.co/api/v2/pokemon/";
    var response;

    $.ajax({
        url : api + pokeId,
        dataType : 'json',
        async : false
    }).done( function(data){
        response = data;
    });

    return response;
}

function Pokemon(data){
    this.name = data.name;
    this.sprite = data.sprites.front_default;
    this.hp = data.stats[0].base_stat;
    this.attack = data.stats[1].base_stat;
    this.defense = data.stats[2].base_stat;
    this.special_attack = data.stats[3].base_stat;
    this.special_defense = data.stats[4].base_stat;
    this.speed = data.stats[5].base_stat;
}

function generateComHand(index){
    for(let i = 0; i < index; i++){
        comHand.push(comDeck.pop());
    }
}

function generatePlayerHand(index){
    for(let i = 0; i < index; i++){
        playerHand.push(playerDeck.pop());
    }
}

function referenceCards(){
    divCards[0] = document.querySelector('#card_1');
    divCards[1] = document.querySelector('#card_2');
    divCards[2] = document.querySelector('#card_3');
    divCards[3] = document.querySelector('#card_4');
    divCards[4] = document.querySelector('#card_5');
}

function generatePlayerCardsHand(){
    for(let i = 0; i < playerHand.length; i++){
        //criando nova div card
        let divCardPoke = document.createElement('div');
        divCardPoke.setAttribute("id", "card");
        divCardPoke.setAttribute("class", ""+i);
        
        //up
        let divUp = document.createElement('div');
        divUp.setAttribute("id", "up");

        let pName = document.createElement('p');
        pName.setAttribute("id", "name");
        pName.innerHTML = playerHand[i].name.toUpperCase();

        let imgSprite = document.createElement('img');
        imgSprite.setAttribute("id", "sprite");
        imgSprite.setAttribute("src", ""+playerHand[i].sprite);

        divUp.appendChild(pName);
        divUp.appendChild(imgSprite);

        //bottom
        let divBottom = document.createElement('div');
        divBottom.setAttribute("id", "bottom");

        let pHp = document.createElement('p');
        pHp.setAttribute("id", ""+i);
        pHp.setAttribute("class", "stats");
        pHp.setAttribute("onclick", "onclickEvent(event)");
        pHp.innerHTML = 'HP - '+playerHand[i].hp;

        let pAttack = document.createElement('p');
        pAttack.setAttribute("id", ""+i);
        pAttack.setAttribute("class", "stats");
        pAttack.setAttribute("onclick", "onclickEvent(event)");
        pAttack.innerHTML = 'ATK - '+playerHand[i].attack;

        let pDefense = document.createElement('p');
        pDefense.setAttribute("id", ""+i);
        pDefense.setAttribute("class", "stats");
        pDefense.setAttribute("onclick", "onclickEvent(event)");
        pDefense.innerHTML = 'DEF - '+playerHand[i].defense;

        let pSpecialDefense = document.createElement('p');
        pSpecialDefense.setAttribute("id", ""+i);
        pSpecialDefense.setAttribute("class", "stats");
        pSpecialDefense.setAttribute("onclick", "onclickEvent(event)");
        pSpecialDefense.innerHTML = 'ESP_DEF - '+playerHand[i].special_defense;

        let pSpecialAttack = document.createElement('p');
        pSpecialAttack.setAttribute("id", ""+i);
        pSpecialAttack.setAttribute("class", "stats");
        pSpecialAttack.setAttribute("onclick", "onclickEvent(event)");
        pSpecialAttack.innerHTML = 'ESP_ATK - '+playerHand[i].special_attack;

        let pSpeed = document.createElement('p');
        pSpeed.setAttribute("id", ""+i);
        pSpeed.setAttribute("class", "stats");
        pSpeed.setAttribute("onclick", "onclickEvent(event)");
        pSpeed.innerHTML = 'SPEED - '+playerHand[i].speed;

        divBottom.appendChild(pHp);
        divBottom.appendChild(pAttack);
        divBottom.appendChild(pDefense);
        divBottom.appendChild(pSpecialAttack);
        divBottom.appendChild(pSpecialDefense);
        divBottom.appendChild(pSpeed);

        let hrLine = document.createElement('hr');
        hrLine.setAttribute("id", "line");
       
        divCardPoke.appendChild(divUp);
        divCardPoke.appendChild(hrLine);
        divCardPoke.appendChild(divBottom);

        divCards[i].appendChild(divCardPoke);
    }
}

function onclickEvent(e){
    playerChoiceIndex = e.srcElement.id;
    playerChoiceAtribute = e.target.innerHTML;
    playerChoice = playerChoiceAtribute.split(" ")[2];
    playerSetup = true;
}

function selectComCardAtribute(){
    var rand = Math.round( (Math.random(5) * 5));
    var maior = 0;

    if(rand == 0){
        for(let i = 0; i < comHand.length; i++){
            if(comHand[i].hp > maior){ 
                maior = comHand[i].hp;
                comChoiceIndex = i;
            }
        }
        comChoiceAtribute = "HP - "+maior;
    }else if(rand == 1){
        for(let i = 0; i < comHand.length; i++){
            if(comHand[i].attack > maior){ 
                maior = comHand[i].attack;
                comChoiceIndex = i;
            }
        }
        comChoiceAtribute = "ATK - "+maior;
    }else if(rand == 2){
        for(let i = 0; i < comHand.length; i++){
            if(comHand[i].defense > maior){ 
                maior = comHand[i].defense;
                comChoiceIndex = i;
            }
        }
        comChoiceAtribute = "DEF - "+maior;
    }else if(rand == 3){
        for(let i = 0; i < comHand.length; i++){
            if(comHand[i].special_attack > maior){ 
                maior = comHand[i].special_attack;
                comChoiceIndex = i;
            }
        }
        comChoiceAtribute = "ESP_ATK - "+maior;
    }else if(rand == 4){
        for(let i = 0; i < comHand.length; i++){
            if(comHand[i].special_defense > maior){ 
                maior = comHand[i].special_defense;
                comChoiceIndex = i;
            }
        }
        comChoiceAtribute = "ESP_DEF - "+maior;
    }else{
        for(let i = 0; i < comHand.length; i++){
            if(comHand[i].speed > maior){ 
                maior = comHand[i].speed;
                comChoiceIndex = i;
            }
        }
        comChoiceAtribute = "SPD - "+maior;
    }

    return maior;
}

function playerCardChoice(){
    generateCardsBattle(playerHand, cardFlipPlayer, playerChoiceIndex);
    setAtributeFromFront(playerFront);
}

function comCardChoice(){
    generateCardsBattle(comHand, cardFlipCom, comChoiceIndex);
    setAtributeFromFront(comFront);
}

function setAtributeFromFront(front){
    front.style.background= "url('img/background/deck.png')";
    front.style.backgroundAttachment= "cover";
    front.style.backgroundPosition= "center center";
    front.style.backgroundSize= "cover";
    front.style.border= "2px solid black";
    front.style.transform= "rotateY(180deg)";
}

function generateCardsBattle(hand, div, index){
    
    let divCardPoke = document.createElement('div');
    divCardPoke.setAttribute("id", "card_choice");
    divCardPoke.setAttribute("class", "back");
    divCardPoke.setAttribute("class", "face");
    
    //up
    let divUp = document.createElement('div');
    divUp.setAttribute("id", "up");

    let pName = document.createElement('p');
    pName.setAttribute("id", "name");
    pName.innerHTML = hand[index].name.toUpperCase();

    let imgSprite = document.createElement('img');
    imgSprite.setAttribute("id", "sprite");
    imgSprite.setAttribute("src", ""+hand[index].sprite);

    divUp.appendChild(pName);
    divUp.appendChild(imgSprite);

    //bottom
    let divBottom = document.createElement('div');
    divBottom.setAttribute("id", "bottom");

    let pHp = document.createElement('p');
    pHp.setAttribute("class", "stats_02");
    pHp.innerHTML = 'HP - '+hand[index].hp;

    let pAttack = document.createElement('p');
    pAttack.setAttribute("class", "stats_02");
    pAttack.innerHTML = 'ATK - '+hand[index].attack;

    let pDefense = document.createElement('p');
    pDefense.setAttribute("class", "stats_02");
    pDefense.innerHTML = 'DEF - '+hand[index].defense;

    let pSpecialDefense = document.createElement('p');
    pSpecialDefense.setAttribute("class", "stats_02");
    pSpecialDefense.innerHTML = 'ESP_DEF - '+hand[index].special_defense;

    let pSpecialAttack = document.createElement('p');
    pSpecialAttack.setAttribute("class", "stats_02");
    pSpecialAttack.innerHTML = 'ESP_ATK - '+hand[index].special_attack;

    let pSpeed = document.createElement('p');
    pSpeed.setAttribute("class", "stats_02");
    pSpeed.innerHTML = 'SPEED - '+hand[index].speed;

    divBottom.appendChild(pHp);
    divBottom.appendChild(pAttack);
    divBottom.appendChild(pDefense);
    divBottom.appendChild(pSpecialAttack);
    divBottom.appendChild(pSpecialDefense);
    divBottom.appendChild(pSpeed);

    let hrLine = document.createElement('hr');
    hrLine.setAttribute("id", "line");

    divCardPoke.appendChild(divUp);
    divCardPoke.appendChild(hrLine);
    divCardPoke.appendChild(divBottom);

    div.appendChild(divCardPoke);
}

function verifyPlayerCardsHand(){
    if(playerHand.length < 5){
        freeCardsHand();
        generatePlayerHand(1);
        generatePlayerCardsHand();
        player.graveyard++;
    }
}

function verifyComCardsHand(){
    if(comHand.length < 5){
        generateComHand(1);
        com.graveyard++;
    }
}

function freeCards(div, front){
    let nodeRemove = div.querySelector('#card_choice');
    if(nodeRemove !== null){
        div.removeChild(nodeRemove);
    }

    front.style.background= "";
    front.style.backgroundAttachment= "";
    front.style.backgroundPosition= "";
    front.style.backgroundSize= "";
    front.style.border= "";
    front.style.transform= "";
}

function freeCardsHand(){
    let card_1 = document.querySelector('#card_1');
    let card_2 = document.querySelector('#card_2');
    let card_3 = document.querySelector('#card_3');
    let card_4 = document.querySelector('#card_4');
    let card_5 = document.querySelector('#card_5');

    let exists_1 = card_1.querySelector('#card');
    let exists_2 = card_2.querySelector('#card');
    let exists_3 = card_3.querySelector('#card');
    let exists_4 = card_4.querySelector('#card');
    let exists_5 = card_5.querySelector('#card');

    if(exists_1 !== null){
        card_1.removeChild(exists_1);
    }

    if(exists_2 !== null){
        card_2.removeChild(exists_2);
    }

    if(exists_3 !== null){
        card_3.removeChild(exists_3);
    }

    if(exists_4 !== null){
        card_4.removeChild(exists_4);
    }

    if(exists_5 !== null){
        card_5.removeChild(exists_5);
    }

    animatedCard();
}

function draw() {
    drawLife(playerCanvas, playerCanvasContext, xPlayer, player.life);
    drawLife(comCanvas, comCanvasContext, xCom, com.life);

    window.requestAnimationFrame(draw);
}

function drawLife(canvas, context, x, life){
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#FF0000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    if(life < 50){
        context.fillStyle = '#FF8C00';
    }else if(life < 100){
        context.fillStyle = '#FFFF00';
    }else{
        context.fillStyle = '#00FF00';
    }

    context.fillRect(0, 0, canvas.width-(x*1.5), canvas.height);
}

function createWindowMesage(mesage, state, btn){
    var panel = document.createElement('div');
    panel.setAttribute('class', 'msgBox');

    var msg = document.createElement('p');
    msg.textContent = mesage;

    var closeBtn = document.createElement('button');
    closeBtn.setAttribute('class', 'closeBtn');
    closeBtn.textContent = btn;

    panel.appendChild(msg);
    panel.appendChild(closeBtn);

    pageContent.appendChild(panel);

    closeBtn.onclick = function(){
        panel.parentNode.removeChild(panel);
        if(state == 1){
            turnCom = true;
        }else if(state == 2){
            flipCards = true;
        }
        gameStatus = "in_game";
    }
}

function flipCardChoice(){
    cardFlipPlayer.classList.toggle("flip");
    cardFlipCom.classList.toggle("flip");
}

function initBattle(){
    playerAtribute.innerHTML = "Player: "+playerChoiceAtribute;
    comAtribute.innerHTML = "Com: "+comChoiceAtribute;

    let msgType;
    let hit;

    if(comChoice > playerChoice){
        hit = comChoice - playerChoice;
        player.life -= hit;
        xPlayer += hit;
        playerGraveyard.push(playerHand.splice(playerChoiceIndex, 1));
        msgType = 1;
    }else if(comChoice == playerChoice){
        msgType = 0;
    }else{
        hit = playerChoice - comChoice;
        com.life -= hit;
        xCom += hit;
        comGraveyard.push(comHand.splice(comChoiceIndex, 1));
        msgType = 2;
    }

    refreshStats();
    createBattleMesage(hit, msgType);
}

function createBattleMesage(hit, msgType){
    var panel = document.createElement('div');
    panel.setAttribute('class', 'msgBox');

    var atributes = document.createElement('p');
    atributes.textContent = playerChoiceAtribute+' x '+comChoiceAtribute;
    panel.appendChild(atributes);

    if(msgType != 0){
        var msg_1 = document.createElement('p');
        var msg_2 = document.createElement('p');
        var msg_3 = document.createElement('p');
        var msg_4 = document.createElement('p');

        if(msgType == 1){
            msg_1.textContent = "Seu pokemon perdeu!!!";
            msg_2.textContent = "Ele foi enviado para o cemiterio!!!";
            msg_3.textContent = "Você tomou "+hit+" de dano na sua vida!!!";
            msg_4.textContent = "Você comprou uma nova carta!!!";
        }else{
            msg_1.textContent = "Seu pokemon ganhou!!!";
            msg_2.textContent = "Pokemon do Com foi enviado para o cemiterio!!!";
            msg_3.textContent = "Com tomou "+hit+" de dano na sua vida!!!";
            msg_4.textContent = "Com comprou uma nova carta!!!";
        }

        panel.appendChild(msg_1);
        panel.appendChild(msg_2);
        panel.appendChild(msg_3);
        panel.appendChild(msg_4);
    }else{
        var msg = document.createElement('p');
        msg.textContent = "Empate!!!";
        panel.appendChild(msg);
    }

    var closeBtn = document.createElement('button');
    closeBtn.setAttribute('class', 'closeBtn');
    closeBtn.textContent = 'Close';
    panel.appendChild(closeBtn);

    pageContent.appendChild(panel);

    closeBtn.onclick = function(){
        panel.parentNode.removeChild(panel);
        if(gameOver()){
            gameStatus = "game_over";
        }else{
            gameStatus = "in_game";
        }
        deleteCardsChoice = true;
    }
}

function resetAtributesChoice(){
    playerAtribute.innerHTML = "Player Choice Atribute";
    comAtribute.innerHTML = "Com Choice Atribute";
}

function gameOver(){
    if(player.life <= 0){
        msgGameOver = "Perdeu";
        player.life = 0;
        return true;
    }

    if(com.life <= 0){
        msgGameOver = "Ganhou";
        gameStatus = "game_over";
        com.life = 0;
        return true;
    }

    return false;
}

function createGameOverMesage(winner){
    var panel = document.createElement('div');
    panel.setAttribute('class', 'msgBox');

    var msgGameOver = document.createElement('p');
    msgGameOver.textContent = "!!! Game-Over !!!";

    var msg = document.createElement('p');
    if(winner == "Perdeu"){
        msg.textContent = ":( - Você "+winner+"!!!";
    }else{
        msg.textContent = "Uhoooooohhhhhh - Você "+winner+"!!!";
    }

    var closeBtn = document.createElement('button');
    closeBtn.setAttribute('class', 'closeBtn');
    closeBtn.textContent = 'New Game';

    panel.appendChild(msgGameOver);
    panel.appendChild(msg);
    panel.appendChild(closeBtn);

    pageContent.appendChild(panel);

    closeBtn.onclick = function(){
        location.reload();
    }
}

function createInitialMesage(){
    var panel = document.createElement('div');
    panel.setAttribute('class', 'msgBoxNewGame');

    //Div primeira coluna (regras)
    var firstColumn = document.createElement('div');
    firstColumn.setAttribute('class', 'f_column');

    var h2Rules = document.createElement('h2');
    h2Rules.textContent = "Regras do Jogo!";

    var rules_p_1 = document.createElement('p');
    rules_p_1.textContent = "1- São 32 cartas para cada jogador, 5 cartas na mão de cada jogador;";

    var rules_p_2 = document.createElement('p');
    rules_p_2.textContent = "2- Os dois jogadores iniciam com 200 pontos de vida, o primeiro que chegar a 0 perde;";

    var rules_p_3 = document.createElement('p');
    rules_p_3.textContent = "3- Passe o mouse sobre uma carta, esta carta ficara em destaque, "+
    "com a carta em destaque você seleciona um atributo;";

    var rules_p_4 = document.createElement('p');
    rules_p_4.textContent = "4- Clique com o botão esquerdo do mouse em algum atributo da carta em destaque, "+
    "você ira selecionar esta carta e este atributo, a carta ira para a area de batalha;";

    var rules_p_5 = document.createElement('p');
    rules_p_5.textContent = "5- A carta perdedora é enviada para o cemiterio,"+
    " o jogador dono desta carta toma um dano na sua vida equivalente a diferença "+
    "entre os atributos selecionados e compra uma nova carta para sua mão;";

    //Div segunda coluna (new game)
    var secondColumn = document.createElement('div');
    secondColumn.setAttribute('class', 'f_column');

    var h2NewGame = document.createElement('h2');
    h2NewGame.textContent = "New Game!";

    var msgSetName = document.createElement('p');
    msgSetName.textContent = "Digite seu nome!";

    var inputName = document.createElement('input');
    inputName.setAttribute('id', 'input_name');

    var btnNewGame = document.createElement('button');
    btnNewGame.setAttribute('class', 'btnNewGame');
    btnNewGame.textContent = 'New Game';

    //Div terceira coluna ( )
    var thirdColumn = document.createElement('div');
    thirdColumn.setAttribute('class', 'f_column');

    var h2Info = document.createElement('h2');
    h2Info.textContent = "Informações!";

    firstColumn.appendChild(h2Rules);
    firstColumn.appendChild(rules_p_1);
    firstColumn.appendChild(rules_p_2);
    firstColumn.appendChild(rules_p_3);
    firstColumn.appendChild(rules_p_4);
    firstColumn.appendChild(rules_p_5);

    secondColumn.appendChild(h2NewGame);
    secondColumn.appendChild(msgSetName);
    secondColumn.appendChild(inputName);
    secondColumn.appendChild(btnNewGame);

    thirdColumn.appendChild(h2Info);

    panel.appendChild(firstColumn);
    panel.appendChild(secondColumn);
    panel.appendChild(thirdColumn);

    pageContent.appendChild(panel);

    btnNewGame.onclick = function(){
        if(inputName.value.length > 0){
            playerNameNav.textContent = inputName.value;
            playerNameStats.textContent = inputName.value;
            panel.parentNode.removeChild(panel);
            gameStatus = "init_game";
        }else{
            alert("Por favor Digite seu nome!!!");
        }
    }
}

function btnNewGameOnClick(event){
    var result = confirm("Ter certeza que deseja iniciar um novo jogo?");
    if(result){
        location.reload();
    }
}

function animatedCardsHand(){
    playerCardsHandArea.classList.toggle("cards_animated");
}

function removeCardAnimated(){

}

function animatedCard(){
    divCards[4].classList.toggle("cards_animated");
    setTimeout(removeCardAnimated, 1100);
}

function removeCardAnimated(){
    divCards[4].classList.toggle("cards_animated");
}