/**
 * Calendar class. Manages time, seasons and random events of the game
 */
dojo.declare("com.nuclearunicorn.game.Calendar", null, {
	game: null,

	seasons: [
		{
			name: "spring",
			title: $I("calendar.season.spring"),
			shortTitle: $I("calendar.season.spring.short"),

			modifiers:{
				"catnip" : 1.5
			}
		},
		{
			name: "summer",
			title: $I("calendar.season.summer"),
			shortTitle: $I("calendar.season.summer.short"),

			modifiers:{
				"catnip" : 1.0
			}
		},
		{
			name: "autumn",
			title: $I("calendar.season.autumn"),
			shortTitle: $I("calendar.season.autumn.short"),

			modifiers:{
				"catnip" : 1.0
			}
		},
		{
			name: "winter",
			title: $I("calendar.season.winter"),
			shortTitle: $I("calendar.season.winter.short"),

			modifiers:{
				"catnip" : 0.25
			}
		}],

	//Charon, Umbra (black hole), Yarn (terraformable?), Helios (Sun), Cath, Redmoon (Cath satellite), Dune, Piscine, Terminus (ice giant), Kairo (dwarf planet)
	cycles: [
		{
			name: "charon",
			title: "Charon",
			glyph: "&#9049;",
			uglyph: "⍙",
			effects: {
				"moonOutpost-unobtainiumPerTickSpace": 0.9
			},
			festivalEffects: {
				"catnip": 1.5,
				"wood": 1.5,
				"minerals": 1.5
			}
		},
		{
			name: "umbra",
			title: "Umbra",
			glyph: "&#9062;",
			uglyph: "⍦",
			effects: {
				"planetCracker-uraniumPerTickSpace": 0.9,
				"hydrofracturer-oilPerTickAutoprodSpace": 0.75
			},
			festivalEffects: {
				"coal": 1.5,
				"iron": 1.5,
				"titanium": 1.5,
				"gold": 1.5
			}
		},
		{
			name: "yarn",
			title: "Yarn",
			glyph: "&#9063;",
			uglyph: "⍧",
			effects: {
				"researchVessel-starchartPerTickBaseSpace": 0.5
			},
			festivalEffects: {
				"culture": 2
			}
		},
		{
			name: "helios",
			title: "Helios",
			glyph: "&#8978;",
			uglyph: "⌒",
			effects: {
				"sunlifter-energyProduction": 1.5
			},
			festivalEffects: {
				"faith": 2,
				"unicorns": 1.25
			}
		},
		{
			name: "cath",
			title: "Cath",
			glyph: "&#9022;",
			uglyph: "⌾",
			effects: {
				"spaceElevator-prodTransferBonus": 2,
				"sattelite-starchartPerTickBaseSpace": 2,
				"sattelite-observatoryRatio": 2,
				"spaceStation-scienceRatio": 1.5,
				"spaceBeacon-starchartPerTickBaseSpace": 0.1
			},
			festivalEffects: {
				"manpower": 2
			}
		},
		{
			name: "redmoon",
			title: "Redmoon",
			glyph: "&#9052;",
			uglyph: "⍜",
			effects: {
				"moonOutpost-unobtainiumPerTickSpace": 1.2
			},
			festivalEffects: {
				"unobtainium": 2
			}
		},
		{
			name: "dune",
			title: "Dune",
			glyph: "&#9067;",
			uglyph: "⍫",
			effects: {
				"planetCracker-uraniumPerTickSpace": 1.1,
				"hydrofracturer-oilPerTickAutoprodSpace": 1.5
			},
			festivalEffects: {
				"uranium": 2
			}
		},
		{
			name: "piscine",
			title: "Piscine",
			glyph: "&#9096;",
			uglyph: "⎈",
			effects: {
				"researchVessel-starchartPerTickBaseSpace": 1.5
			},
			festivalEffects: {
				"science": 2
			}
		},
		{
			name: "terminus",
			title: "Terminus",
			glyph: "&#9053;",
			uglyph: "⍝",
			effects: {
				"sunlifter-energyProduction": 0.5
			},
			festivalEffects: {
				"oil": 2
			}
		},
		{
			name: "kairo",
			title: "Kairo",
			glyph: "&#8483;",
			uglyph: "℣",
			effects: {
				"spaceBeacon-starchartPerTickBaseSpace": 5,
				"spaceElevator-prodTransferBonus": 0.5,
				"sattelite-starchartPerTickBaseSpace": 0.75,
				"sattelite-observatoryRatio": 0.75,
				"spaceStation-scienceRatio": 0.75
			},
			festivalEffects: {
				"starchart": 5
			}
		}
	],

	season: 0,
	cycle: 0,
	cycleYear: 0,
	yearsPerCycle: 5,

	daysPerSeason: 100,
	day: 0,
	year: 0,
	dayPerTick: 0.1,

	eventChance: 0,

	weather: null,	//warm / cold

	festivalDays: 0,

	futureSeasonTemporalParadox: -1,

	cryptoPrice: 1000,
	cryptoPriceMax: 1100,

	observeBtn: null,
	observeRemainingTime: 0,
	observeClear: function(){
		dojo.destroy(this.observeBtn);
		this.observeBtn = null;
		this.observeRemainingTime = 0;

		this.game.ui.observeClear();
	},
	observeHandler: function(){
		this.observeClear();
		this.game.stats.getStat("eventsObserved").val++;

		var isSilent = false;
		if (this.game.workshop.get("seti").researched){
			isSilent = true;
		}

		var celestialBonus = 0;
		if (this.game.workshop.get("celestialMechanics").researched){
			celestialBonus = 5;	//20% bonus in the normal mode
			if (this.game.ironWill){
				celestialBonus = 15;	//60% in the IW
			}
		}

		var sciBonus = (25 + celestialBonus) * ( 1 + this.game.getEffect("scienceRatio"));
		var sciGain = this.game.resPool.addResEvent("science", sciBonus);

		if (sciGain > 0 && !isSilent){
			this.game.msg(this.game.getDisplayValueExt(sciGain, true) + " science!", "", "astronomicalEvent", true);
		}

		if (this.game.science.get("astronomy").researched){
			if (!isSilent){
				this.game.msg($I("calendar.msg.starchart"), "", "astronomicalEvent");
			}
			this.game.resPool.addResEvent("starchart", 1);
		}
	},//this.observeHandler

	observeTimeout: function(){

		this.observeClear();

		var autoChance = (this.game.getEffect("starAutoSuccessChance") * 100);	//in %
		if (this.game.prestige.getPerk("astromancy").researched){
			autoChance *= 2;
		}

		var rand = this.game.rand(100);

		if(
			(this.game.ironWill && (this.game.rand(100) <= 25)) ||
			(rand <= autoChance)
		){
			this.observeHandler();
		}

	},//observeTimeout

	constructor: function(game, displayElement) {
		this.game = game;
		this.displayElement = displayElement;
	},

	render: function() {

	},

	/* Return the whole number of days elapsed in the season, correcting for
	 possible floating-point errors.
	 */
	integerDay: function () {
		return Math.floor(this.day + 0.5 * this.dayPerTick);
	},

	update: function() {

	},

	cycleEffectsBasics: function(effects, building_name) {
		if (this.game.prestige.getPerk("numerology").researched){
			var list_effects_cycle = this.cycles[this.cycle].effects;

			for (var effect in effects) {
				var effect_cycle = building_name + "-" + effect;
				if (typeof list_effects_cycle[effect_cycle] !== "undefined") {
					effects[effect] *= list_effects_cycle[effect_cycle];
				}
			}
		}

		return effects;
	},

	cycleEffectsFestival: function(effects) {
		if (this.game.prestige.getPerk("numeromancy").researched && this.game.calendar.festivalDays){
			var list_festivalEffects_cycle = this.cycles[this.cycle].festivalEffects;

			for (var effect in effects) {

				var effect_cycle = effect;
				if (typeof list_festivalEffects_cycle[effect_cycle] !== "undefined") {
					effects[effect] *= list_festivalEffects_cycle[effect_cycle];
				}
			}
		}

		return effects;
	},

	isDarkFuture: function() {
		return (this.year - 40000 - this.game.time.flux - this.game.getEffect("timeImpedance") >= 0);
	},

	tick: function(){

		/* The behavior is not correct, maybe due to possible float-point. */
		//TODO: clarify what is exactly wrong

		if (this.game.time.isAccelerated) {
			this.day += Math.round(this.dayPerTick * ((this.game.getRateUI() - this.game.rate) / this.game.rate) * 10) / 10;	// *.x float point
		} else {
			this.day += this.dayPerTick;
		}

		if(this.observeRemainingTime > 0){
			this.observeRemainingTime--;
			if(this.observeRemainingTime == 0){
				this.observeTimeout();
			}
		}

		//this.day += this.dayPerTick;

		var intday = this.integerDay(),
			newseason = false,
			newyear = false;

		if (Math.abs(this.day - intday) < 0.5 * this.dayPerTick) {
			this.day = intday; /* minimize floating point error */

			if (this.day >= this.daysPerSeason) {
				this.day = 0;
				this.season += 1;
				newseason = true;

				if (this.season >= this.seasons.length) {
					this.season = 0;
					if (!(this.game.challenges.currentChallenge == "1000Years" && this.year >= 500)) {
						this.year += 1;
					}
					newyear = true;
				}
			}

			/*The new date must be fully computed before any of the individual onNew functions are called
			 to ensure the onNew functions have a consistent view of what the current date is.
			 */
			this.onNewDay();
			if (newseason) {
				this.onNewSeason();
				if (newyear) {
					this.onNewYear(true);
				}
			}

			/* The update function must be called after the onNew functions, which may make changes
			 that need to be visible (e.g. showing events in the document title)
			 */
			this.update();
		}
	},

	/*
	 * All daily chances are in 1/10K units (OPTK) (0.0X%)
	 */
	onNewDay: function(){
		if (this.festivalDays){
			this.festivalDays--;
		}

		var chanceRatio = 1;
		var unicornChanceRatio = 1;

		if (this.game.prestige.getPerk("chronomancy").researched){
			chanceRatio = 1.1;
		}
		if (this.game.prestige.getPerk("unicornmancy").researched){
			unicornChanceRatio = 1.1;
		}

		chanceRatio *= (1 + this.game.getEffect("timeRatio") * 0.25);
		unicornChanceRatio *= (1 + this.game.getEffect("timeRatio") * 0.25);

		if (this.day < 0){
			//------------------------- void -------------------------
			this.game.resPool.addResEvent("void", this.game.resPool.getVoidQuantity()); // addResEvent because during Temporal Paradox
			this.game.time.flux-=0.0025;
		}
		//------------------------- relic -------------------------
		else {
			this.game.resPool.addResPerTick("relic", this.game.getEffect("relicPerDay"));
		}

		//------------------------- astronomical events -------------------------
		var chance = 25;									//25 OPTK of event per day	(0.25%)
		chance += (this.game.getEffect("starEventChance") * 10000);
		chance *= chanceRatio;

		if (this.game.prestige.getPerk("astromancy").researched){
			chance *= 2;
		}

		if (this.game.rand(10000) < chance &&
			this.game.bld.get("library").on > 0){
			if (this.observeRemainingTime){
				this.observeTimeout();
			}
			this.observeClear();

			//---------------- SETI hack-------------------
			if (this.game.workshop.get("seti").researched){
				this.observeHandler();
			}else{
				this.game.msg($I("calendar.msg.event"), "", "astronomicalEvent");
				var node = dojo.byId("observeButton");

				this.observeBtn = dojo.create("input", {
					id: "observeBtn",
					type: "button",
					value: $I("navbar.observe")
				}, node);

				dojo.connect(this.observeBtn, "onclick", this, this.observeHandler);

				this.observeRemainingTime = 300;

				this.game.ui.observeCallback(this.observeHandler);
			}
		}


		//------------------------- meteors -------------------------
		var iwChance = 0;
		if (this.game.ironWill){
			iwChance = 40;	// +0.4 additional chance of falling meteors
		}

		var baseChance = 10 * chanceRatio;
		if (this.game.rand(10000) < (baseChance + iwChance) &&
			this.game.science.get("mining").researched){	//0.1% chance of meteors

			var mineralsAmt = 50 + 25 * this.game.getEffect("mineralsRatio");

			if (this.game.ironWill){
				mineralsAmt += mineralsAmt * 0.1;	//+10% of minerals for iron will
			}

			var mineralsGain = this.game.resPool.addResEvent("minerals", mineralsAmt);

			var sciGain = 0;
			if (this.game.workshop.get("celestialMechanics").researched){
				var sciBonus = 15 * ( 1 + this.game.getEffect("scienceRatio"));
				sciGain = this.game.resPool.addResEvent("science", sciBonus);
			}

			if (mineralsGain > 0 || sciGain > 0){
				var meteorMsg = $I("calendar.msg.meteor");

				if (mineralsGain > 0){
					meteorMsg += ", +" + this.game.getDisplayValueExt(mineralsGain) + " " + $I("resources.minerals.title");
				}
				if (sciGain > 0) {
					meteorMsg += ", +" + this.game.getDisplayValueExt(sciGain) + " " + $I("resources.science.title");
				}

				this.game.msg(meteorMsg + "!", null, "meteor");
			}

			//TODO: make meteors give titanium on higher levels
		}

		//------------------------- 0.035% chance of spawning unicorns in Iron Will -----------------
		var zebras = this.game.resPool.get("zebras");

		if (this.game.ironWill){
			var archery = this.game.science.get("archery");
			var unicorns = this.game.resPool.get("unicorns");
			if (this.game.rand(100000) <= 17 * unicornChanceRatio && unicorns.value < 2 && archery.researched){
				this.game.resPool.addResEvent("unicorns", 1);
				this.game.msg($I("calendar.msg.unicorn"));
			}

			if (!zebras.value && archery.researched){
				this.game.resPool.addResEvent("zebras", 1);
				this.game.msg($I("calendar.msg.zebra.hunter"));
			} else if ( zebras.value > 0 && zebras.value <= this.game.karmaZebras && this.game.karmaZebras > 0){
				if (this.game.rand(100000) <= 500){
					this.game.resPool.addResEvent("zebras", 1);
					this.game.msg($I("calendar.msg.zebra.hunter.new"));
					this.game.ui.render();
				}
			}
		}else{
			var zTreshold = 0;
			if (this.game.prestige.getPerk("zebraDiplomacy").researched){
				zTreshold = Math.floor(0.10 * (this.game.karmaZebras + 1));   //5 - 10% of hunters will stay
			}
			if (this.game.prestige.getPerk("zebraCovenant").researched){
				zTreshold = Math.floor(0.50 * (this.game.karmaZebras + 1));   //5 - 50% of hunters will stay
			}
			if (zebras.value > zTreshold ){
				this.game.msg( zebras.value > 1 ?
						$I("calendar.msg.zebra.hunter.departed.pl") :
						$I("calendar.msg.zebra.hunter.departed")
				);
				zebras.value = zTreshold;
				this.game.ui.render();
			}
		}
		//TODO: maybe it is a good idea to start moving daily events to json metadata
		//-------------------------  -------------------

		var riftChance = this.game.getEffect("riftChance");	//5 OPTK
		if (this.game.rand(10000) < riftChance * unicornChanceRatio){
			var unicornBonus = 500 * (1 + this.game.getEffect("unicornsRatioReligion") * 0.1);
			this.game.msg($I("calendar.msg.rift", [this.game.getDisplayValueExt(unicornBonus)]), "notice", "unicornRift");

			this.game.resPool.addResEvent("unicorns", unicornBonus);	//10% of ziggurat buildings bonus
		}
		//----------------------------------------------
		var aliChance = this.game.getEffect("alicornChance");	//0.2 OPTK
		if (this.game.rand(100000) < aliChance){
			this.game.msg($I("calendar.msg.alicorn"), "important", "alicornRift");

			this.game.resPool.addResEvent("alicorn", 1);
			this.game.upgrade({
				zigguratUpgrades: ["skyPalace", "unicornUtopia", "sunspire"]
			});
		}

		// -------------- ivory meteors ---------------
		var meteorChance = 0 + this.game.getEffect("ivoryMeteorChance");	//5 OPTK
		if (this.game.rand(10000) < meteorChance * unicornChanceRatio){

			var ivory = (250 + this.game.rand(1500) * (1 + this.game.getEffect("ivoryMeteorRatio")));
			this.game.msg($I("calendar.msg.ivoryMeteor", [this.game.getDisplayValueExt(ivory)]), "notice", "ivoryMeteor");

			this.game.resPool.addResEvent("ivory", ivory);
		}

		this.game.diplomacy.onNewDay();

		this.adjustCryptoPrices();
	},

	fastForward: function(daysOffset){
        var chanceRatio = 1;
        if (this.game.prestige.getPerk("chronomancy").researched){
            chanceRatio = 1.1;
        }
        var unicornChanceRatio = 1;
        if (this.game.prestige.getPerk("unicornmancy").researched){
            unicornChanceRatio = 1.1;
        }

        chanceRatio *= (1 + this.game.getEffect("timeRatio") * 0.25);
        unicornChanceRatio *= (1 + this.game.getEffect("timeRatio") * 0.25);

		// Auto observable events
        var numberEvents = 0, totalNumberOfEvents = 0;
        if (this.game.bld.get("library").on > 0) {
            var chance = 25;                                    //25 OPTK of event per day  (0.25%)
            chance += (this.game.getEffect("starEventChance") * 10000);
            chance *= chanceRatio;

            if (this.game.prestige.getPerk("astromancy").researched){
                chance *= 2;
            }

            var autoChance = this.game.getEffect("starAutoSuccessChance");
            if (this.game.prestige.getPerk("astromancy").researched){
                autoChance *= 2;
            }

            if (this.game.workshop.get("seti").researched) {
                autoChance = 1;
            }
            autoChance = Math.min(autoChance, 1);
            //console.log("chance="+chance+", autoChance="+autoChance);
            numberEvents = Math.round(daysOffset * chance * autoChance / 10000);
            //console.log("number of startcharts="+count);
            if (numberEvents) {
                this.game.resPool.addResEvent("starchart", numberEvents);
            }

            var celestialBonus = 0;
            if (this.game.workshop.get("celestialMechanics").researched){
                celestialBonus = 5; //20% bonus in the normal mode
                if (this.game.ironWill){
                    celestialBonus = 15;    //60% in the IW
                }
            }

            var sciBonus = numberEvents * ((25 + celestialBonus) * ( 1 + this.game.getEffect("scienceRatio")));
            this.game.resPool.addResEvent("science", sciBonus);

        }

        totalNumberOfEvents+=numberEvents;

        //------------------------- meteors -------------------------
		var iwChance = 0;
		if (this.game.ironWill){
			iwChance = 40;	// +0.4 additional chance of falling meteors
		}

		var baseChance = 10 * chanceRatio;
		if (this.game.science.get("mining").researched){	//0.1% chance of meteors

			numberEvents = Math.round(daysOffset * (baseChance + iwChance) / 10000);

			var mineralsAmt = 50 + 25 * this.game.getEffect("mineralsRatio");

			if (this.game.ironWill){
				mineralsAmt += mineralsAmt * 0.1;	//+10% of minerals for iron will
			}

			var mineralsGain = this.game.resPool.addResEvent("minerals", numberEvents * mineralsAmt);

			if (this.game.workshop.get("celestialMechanics").researched){
				var sciBonus = 15 * ( 1 + this.game.getEffect("scienceRatio"));
				var sciGain = this.game.resPool.addResEvent("science", numberEvents * sciBonus);
			}

			//TODO: make meteors give titanium on higher levels

			totalNumberOfEvents+=numberEvents;
		}



		//------------------------- 0.035% chance of spawning unicorns in Iron Will -----------------
		var zebras = this.game.resPool.get("zebras");

		if (this.game.ironWill){
			var archery = this.game.science.get("archery");
			var unicorns = this.game.resPool.get("unicorns");


			if (unicorns.value < 2 && archery.researched){
				numberEvents = Math.round(daysOffset * 17 * unicornChanceRatio / 100000);
				this.game.resPool.addResEvent("unicorns", numberEvents);
				totalNumberOfEvents+=numberEvents;
			}

			if ( zebras.value > 0 && zebras.value <= this.game.karmaZebras && this.game.karmaZebras > 0){
				numberEvents = Math.round(daysOffset * 500 / 100000);
				this.game.resPool.addResEvent("zebras", numberEvents);
				totalNumberOfEvents+=numberEvents;
			}
		}
		//TODO: maybe it is a good idea to start moving daily events to json metadata
		//-------------------------  -------------------

		var riftChance = this.game.getEffect("riftChance");	//5 OPTK
		numberEvents = Math.round(daysOffset * riftChance * unicornChanceRatio / 10000);
		this.game.resPool.addResEvent("unicorns", numberEvents * 500);
		totalNumberOfEvents+=numberEvents;

		//----------------------------------------------
		var aliChance = this.game.getEffect("alicornChance");	//0.2 OPTK
		numberEvents = Math.round(daysOffset * aliChance / 100000);
		if (numberEvents >= 1) {
			this.game.resPool.addResEvent("alicorn", numberEvents);
			this.game.upgrade({
				zigguratUpgrades: ["skyPalace", "unicornUtopia", "sunspire"]
			});
		}
		totalNumberOfEvents+=numberEvents;

		// -------------- ivory meteors ---------------
		var meteorChance = 0 + this.game.getEffect("ivoryMeteorChance");	//5 OPTK
		numberEvents = Math.round(daysOffset * meteorChance * unicornChanceRatio / 10000);
		if (numberEvents){
			var ivory = (250 + this.game.rand(1500) * (1 + this.game.getEffect("ivoryMeteorRatio")));
			this.game.resPool.addResEvent("ivory", ivory* numberEvents);
		}
		totalNumberOfEvents+=numberEvents;

		var yearsOffset = Math.floor(daysOffset / 400);

		//antimatter
		var resPool = this.game.resPool;
		if (resPool.energyProd >= resPool.energyCons) {
			resPool.addResEvent("antimatter", this.game.getEffect("antimatterProduction") * yearsOffset);
		}
		this.game.resPool.addResPerTick("relic", this.game.getEffect("relicPerDay") * daysOffset);

		//not sure if it is a good idea
		this.game.resPool.addResEvent("void",
			this.game.resPool.getVoidQuantityStatistically() * Math.round(daysOffset * this.game.bld.get("chronosphere").on / 100));


		//==================== other calendar stuff ========================
		//cap years skipped in 1000 years
		if (this.game.challenges.currentChallenge == "1000Years" && this.year + yearsOffset > 500){
			yearsOffset = Math.max(500 - this.year, 0);
		}

		//calculate millenium difference
		var paragon = Math.floor((this.year + yearsOffset) / 1000) - Math.floor(this.year / 1000);
		if (paragon > 0){
			resPool.addResEvent("paragon", paragon);
			this.game.stats.getStat("totalParagon").val += paragon;
		}
		this.year += yearsOffset;
		//------------------------------------------------------------------

        return totalNumberOfEvents;
	},

	onNewSeason: function(){
		this.eventChance = 0;

		if (this.game.rand(100) < 35 && this.year > 3){
			var warmChance = 50;
			if (this.game.challenges.getChallenge("winterIsComing").researched){
				warmChance += 15;
			}

			if (this.game.rand(100) < warmChance){
				this.weather = "warm";
			} else {
				this.weather = "cold";
			}
		}else{
			this.weather = null;
		}

		if (this.season == 2 && this.game.workshop.get("advancedAutomation").researched ){
			this.game.bld.get("steamworks").jammed = false;
		}

		var numChrono = this.game.bld.get("chronosphere").on;
		if (numChrono > 0) {
			if (this.futureSeasonTemporalParadox > 0){
				// Go to future Temporal Paradox season
				this.futureSeasonTemporalParadox--;
			} else {
				// Temporal Paradox
				this.day = -10 - this.game.getEffect("temporalParadoxDay");
				// Calculation of the future Temporal Paradox season
				var futureSeasonTemporalParadox = 0;
				var goon = true;
				while (goon) {
					if (numChrono > this.game.rand(100)) {
						goon = false;
					} else {
						futureSeasonTemporalParadox++;
					}
				}
				this.futureSeasonTemporalParadox = futureSeasonTemporalParadox;
			}
		}

	},

	onNewYear: function(updateUI){

		var ty = this.game.stats.getStat("totalYears");
		ty.val++;

		if (ty.val < this.year){
			ty.val = this.year;
		}

		if (this.year >= 40000) {
			this.game.unlock({chronoforge: ["temporalImpedance"]});
		}

		if (this.game.bld.get("steamworks").jammed) {
			this.game.bld.get("steamworks").jammed = false;	//reset jammed status
		}

		if ( this.year % 1000 === 0 ){
			this.game.resPool.addResEvent("paragon", 1);
			this.game.stats.getStat("totalParagon").val++;
		}

		var pyramidVal = this.game.religion.getZU("blackPyramid").val;
		var markerVal = this.game.religion.getZU("marker").val;
		if ( pyramidVal > 0 ){
			if (this.game.rand(1000) < 35 * pyramidVal * (1 + 0.1 * markerVal)){   //3.5% per year per BP, x10% per marker
				this.game.diplomacy.unlockElders();
			}
		}

		this.cycleYear++;
		if (this.cycleYear > this.yearsPerCycle){
			this.cycleYear = 0;
			this.cycle++;
			if (this.cycle >= this.cycles.length){
				this.cycle = 0;
			}
		}

		// Apply cycleEffect for the newYear
		this.game.upgrade({
			spaceBuilding: this.game.space.spaceBuildingsMap
		});

		var resPool = this.game.resPool;
		if (resPool.energyProd >= resPool.energyCons) {
			resPool.addResEvent("antimatter", this.game.getEffect("antimatterProduction"));
		}

		resPool.addResEvent("temporalFlux", this.game.getEffect("temporalFluxProduction"));

		var aiLevel = this.game.bld.get("aiCore").effects["aiLevel"];
		if (aiLevel > 14){
			var aiApocalypseLevel = aiLevel - 14;
			this.game.msg($I("ai.apocalypse.msg", [aiApocalypseLevel]), "alert", "ai");
			for (var i in this.game.resPool.resources){
				var res = this.game.resPool.resources[i];
				if (res.aiCanDestroy) {
					resPool.addResEvent(res.name, -res.value * 0.01 * aiApocalypseLevel);
				}
			}
		}

		//----------------------------------------------------------
		if (this.game.prestige.getPerk("voidOrder").researched){
			var resonance = this.game.getEffect("voidResonance");
			var orderBonus = this.game.calcResourcePerTick("faith") * (0.1 + resonance);	//10% of faith transfer per priest
			this.game.religion.faith += 400 * orderBonus * (1 + this.game.religion.getFaithBonus() * 0.25);	//25% of the apocypha bonus

			if (resonance) {
				var resAmt = 400 * this.game.calcResourcePerTick("faith") * (resonance);
				this.game.resPool.addResEvent("faith", -resAmt );
				//console.log("resonance feedback:", resAmt);
			}
		}

		//this.adjustCryptoPrices(400);

		if (updateUI) {
			this.game.ui.render();
		}
	},

	/* Use 400 ratio for 1 day, 1 ratio for 1 year*/
	adjustCryptoPrices: function(ratio){

		ratio = ratio || 1;

		if (this.game.science.get("antimatter").researched) {
			var marketFluctuation = this.game.rand(100000);

			if (marketFluctuation < 30000 ) {
				this.cryptoPrice -= this.cryptoPrice * Math.random() * 0.01 / 400;
			} else if (marketFluctuation > 60000) {
				this.cryptoPrice += this.cryptoPrice * Math.random() * 0.01 / 400;
			}

			if (this.cryptoPrice > this.cryptoPriceMax){
				this.cryptoPrice -= this.cryptoPrice * (0.2 + (Math.random() * 0.1));
				this.game.msg("There was a huge crypto market correction");
			}
		}
	},

	getWeatherMod: function(){
		var mod = 0;
		if (this.weather == "warm"){
			mod =  0.15;
		} else if (this.weather == "cold"){
			mod = -0.15;
		}
		return mod;
	},

	getCurSeason: function(){
		if (this.game.challenges.currentChallenge == "winterIsComing"){
			return this.seasons[3];	//eternal winter
		}
		return this.seasons[this.season];
	},

	getCurSeasonTitle: function(){
		var title = this.getCurSeason().title;
		if (this.game.challenges.currentChallenge == "winterIsComing"){
			var numeral = '';
			switch(this.season){
				case 0:
					numeral = "I";
					break;
				case 1:
					numeral = "II";
					break;
				case 2:
					numeral = "III";
					break;
				case 3:
					numeral = "IV";
					break;
			}
			title += " " + numeral;
		}
		return title;
	},

	getCurSeasonTitleShorten: function(){
		var title = this.getCurSeason().shortTitle;
		if (this.game.challenges.currentChallenge == "winterIsComing"){
			var numeral = '';
			switch(this.season){
				case 0:
					numeral = "I";
					break;
				case 1:
					numeral = "II";
					break;
				case 2:
					numeral = "III";
					break;
				case 3:
					numeral = "IV";
					break;
			}
			title += " " + numeral;
		}
		return title;
	},


	resetState: function(){
		this.year = 0;
		this.day = 0;
		this.season = 0;
		this.weather = null;
		this.festivalDays = 0;
		this.cycle = 0;
		this.cycleYear = 0;
		this.futureSeasonTemporalParadox = -1;
		this.observeClear();
	},

	save: function(saveData){
		saveData.calendar = {
			year : this.year,
			day: this.day,
			season: this.season,
			weather: this.weather,
			festivalDays: this.festivalDays,
			cycle: this.cycle,
			cycleYear: this.cycleYear,
			futureSeasonTemporalParadox: this.futureSeasonTemporalParadox,
			cryptoPrice: this.cryptoPrice
		};
	},

	load: function(saveData){
		if (saveData.calendar){
			this.year  = saveData.calendar.year;
			this.day  = saveData.calendar.day;
			this.season  = saveData.calendar.season;
			this.weather = saveData.calendar.weather;
			this.festivalDays = saveData.calendar.festivalDays || 0;
			this.cycle = saveData.calendar.cycle || 0;
			this.cycleYear = saveData.calendar.cycleYear || 0;
			this.futureSeasonTemporalParadox = saveData.calendar.futureSeasonTemporalParadox || -1;
			this.cryptoPrice = saveData.calendar.cryptoPrice || 1000;
		}
	}

});

dojo.declare("com.nuclearunicorn.game.calendar.Event", null, {
});
