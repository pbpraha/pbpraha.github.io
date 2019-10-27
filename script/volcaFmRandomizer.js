var CARRIER_LOOKUP = [
    [1, 3],
    [1, 3],
    [1, 4],
    [1, 4],
    [1, 3, 5],
    [1, 3, 5],
    [1, 3],
    [1, 3],
    [1, 3],
    [1, 4],
    [1, 4],
    [1, 3],
    [1, 3],
    [1, 3],
    [1, 3],
    [1],
    [1],
    [1],
    [1, 4, 5],
    [1, 2, 4],
    [1, 2, 4, 5],
    [1, 3, 4, 5],
    [1, 2, 4, 5],
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5],
    [1, 2, 4],
    [1, 2, 4],
    [1, 3, 6],
    [1, 2, 3, 5],
    [1, 2, 3, 6], 
    [1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5, 6]
];

//  first gen modulators for our purpose are the first modulator fed into a carrier, where that modulator
// is the sole modulator for the carrier.
var FIRST_GEN_MODULATOR_LOOKUP = [
    [2, 4], // 1
    [2, 4], // 2
    [2, 5], // 3
    [2, 5], // 4
    [2, 4, 6], // 5
    [2, 4, 6], // 6
    [2],  // 7
    [2], // 8
    [2], // 9
    [2], // 10
    [2], // 11
    [2], // 12
    [2], // 13
    [2, 4], // 14
    [2, 4], // 15
    [], // 16
    [], // 17
    [], // 18
    [2, 6], // 19
    [3], // 20
    [3, 6], // 21
    [2, 6], // 22
    [3, 6], // 23
    [6], // 24
    [6], // 25
    [3], // 26
    [3], // 27
    [2, 4], // 28
    [4, 6], // 29
    [4], // 30
    [6], // 31
    [] // 32
];

// obviously this is kind of subjective. Runs least to most.
var ALGO_COMPLEXITY_LOOKUP = [
    32, 31, 25, 24, 30, 29, 23, 22, 21, 5, 6, 28, 27, 26, 19, 20, 1, 2, 4, 3, 9, 11, 10, 12, 13, 8, 7, 15, 14, 17, 16, 18,
];

var ATONALILTY_DIVIDERS = [1, 2, 4, 3, 5];

var LFO_SHAPE_COMPLEXITY = [0, 4, 3, 1, 2]; // sample/hold not included because i think it's broken on the volca

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

function randomizer(doc){
    // setup key elements:

    var op_coarseTuners = [
        doc.getElementById("sysex123"),
        doc.getElementById("sysex102"),
        doc.getElementById("sysex81"),
        doc.getElementById("sysex60"),
        doc.getElementById("sysex39"),
        doc.getElementById("sysex18"),
    ];
    var op_fineTuners = [
        doc.getElementById("sysex124"),
        doc.getElementById("sysex103"),
        doc.getElementById("sysex82"),
        doc.getElementById("sysex61"),
        doc.getElementById("sysex40"),
        doc.getElementById("sysex19"),
    ];
    var op_deTuners = [
        doc.getElementById("sysex125"),
        doc.getElementById("sysex104"),
        doc.getElementById("sysex83"),
        doc.getElementById("sysex62"),
        doc.getElementById("sysex41"),
        doc.getElementById("sysex20"),
    ];
    var op_levels = [
        doc.getElementById("sysex121"),
        doc.getElementById("sysex100"),
        doc.getElementById("sysex79"),
        doc.getElementById("sysex58"),
        doc.getElementById("sysex37"),
        doc.getElementById("sysex16"),
    ];
    var op_am = [
        doc.getElementById("sysex119"),
        doc.getElementById("sysex98"),
        doc.getElementById("sysex77"),
        doc.getElementById("sysex56"),
        doc.getElementById("sysex35"),
        doc.getElementById("sysex14"),
    ];
    var op_kvs = [
        doc.getElementById("sysex120"),
        doc.getElementById("sysex99"),
        doc.getElementById("sysex78"),
        doc.getElementById("sysex57"),
        doc.getElementById("sysex36"),
        doc.getElementById("sysex15"),
    ];

    var envelopes = [
        ["sysex105", "sysex106", "sysex107", "sysex108", "sysex109", "sysex110", "sysex111", "sysex112"].map(x => doc.getElementById(x)),
        ["sysex84", "sysex85", "sysex86", "sysex87", "sysex88", "sysex89", "sysex90", "sysex91"].map(x => doc.getElementById(x)),
        ["sysex63", "sysex64", "sysex65", "sysex66", "sysex67", "sysex68", "sysex69", "sysex70"].map(x => doc.getElementById(x)),
        ["sysex42", "sysex43", "sysex44", "sysex45", "sysex46", "sysex47", "sysex48", "sysex49"].map(x => doc.getElementById(x)),
        ["sysex21", "sysex22", "sysex23", "sysex24", "sysex25", "sysex26", "sysex27", "sysex28"].map(x => doc.getElementById(x)),
        ["sysex0", "sysex1", "sysex2", "sysex3", "sysex4", "sysex5", "sysex6", "sysex7"].map(x => doc.getElementById(x))
    ];

    var feedbackInput = doc.getElementById("sysex135")
    var algorithmInput = doc.getElementById("sysex134");
    var lfoSpeedInput =  doc.getElementById("sysex137");
    var pitchModDepthInput = doc.getElementById("sysex139");
    var pitchModSenseInput = doc.getElementById("sysex143");
    var ampModDepthInput = doc.getElementById("sysex140");
    var waveShapeInput = doc.getElementById("sysex142");

    function randomize(atonality, complexity, brightness, 
        hardness, hitness, twang, long,
        wobble, wubble, velocity){
        if(atonality < 0 || atonality > 99){
            throw "atonality out of bounds";
        }
        if(complexity < 0 || complexity > 99){
            throw "complexity out of bounds";
        }
        if(brightness < 0 || brightness > 99){
            throw "brightness out of bounds";
        }
        if(hardness < 0 || hardness > 99){
            throw "hardness out of bounds";
        }
        if(hitness < 0 || hitness > 99){
            throw "hitness out of bounds";
        }
        if(twang < 0 || twang > 99){
            throw "twang out of bounds";
        }
        if(long < 0 || long > 99){
            throw "long out of bounds";
        }
        if(wobble < 0 || wobble > 99){
            throw "wobble out of bounds";
        }
        if(wubble < 0 || wubble > 99){
            throw "wubble out of bounds";
        }
        if(velocity < 0 || velocity > 99){
            throw "velocity out of bounds";
        }

        atonality = parseInt(atonality);
        complexity = parseInt(complexity);
        brightness = parseInt(brightness);
        hardness = parseInt(hardness);
        hitness = parseInt(hitness);
        twang = parseInt(twang);
        long = parseInt(long);
        wobble = parseInt(wobble);
        wubble = parseInt(wubble);
        velocity = parseInt(velocity);

        //choose algorithm
        let algorithm = ALGO_COMPLEXITY_LOOKUP[ 
            Math.max(0, 
                Math.min(ALGO_COMPLEXITY_LOOKUP.length-1,
                     Math.floor(ALGO_COMPLEXITY_LOOKUP.length/100.0*complexity) + randomInt(-ALGO_COMPLEXITY_LOOKUP.length/8, ALGO_COMPLEXITY_LOOKUP.length/8)))
            ] - 1; // -1 because sysex value starts from 0 not 1

        algorithmInput.value = algorithm;

        // set operator levels
        // carriers should be well audible
        // potential tweak would be to adjust things based on how many carriers there actually are?
        let carriers = CARRIER_LOOKUP[algorithm];
        for(let carrierOp of carriers){
            op_levels[carrierOp - 1].value = randomInt(90, 99);
        }
        
        // modulators are governed by a few things ideally long-term, but to begin with, it's just brightness.
        // 1st gen modulators need to be scaled up so that they have an audible effect, the others we just set
        // based on the randomness...

        for(let op = 1; op <= 6; op++){
            if(carriers.includes(op)){
                continue;
            }
            if(FIRST_GEN_MODULATOR_LOOKUP[algorithm].includes(op)){
                op_levels[op -1].value = Math.max(0, Math.min(100, (50 / 100.0 * brightness) + randomInt(-10, 10) + 50))
            }else{
                op_levels[op -1].value = Math.max(0, Math.min(brightness + randomInt(-10, 10)))
            }
        }

        // tuning then. carriers we'll keep between 0 and 2 on coarse I think, because otherwise the range gets away from you a bit
        for(let carrier of carriers){
            op_coarseTuners[carrier - 1].value = randomInt(0, 3);
        }

        // so the atonality is going to be a little complex at the bottom end we just want detune, from there we have 
        // small amounts of fine but really it's more about the relationships than the amount.
        // (also brightness will control the coarse)

        for(let op = 1; op <= 6; op++){
            if(carriers.includes(op)){
                continue;
            }

            let coarse = randomInt(0, 32 / 100.0 * brightness);
            op_coarseTuners[op - 1].value = coarse;

            let fine = 0;

            let firstFineDividerPossibility = Math.floor((atonality * ATONALILTY_DIVIDERS.length) / 100) + 1;
            let fineDivider = ATONALILTY_DIVIDERS[randomInt(0, firstFineDividerPossibility)];
            fine += randomInt(0, fineDivider) * (100 / fineDivider);

            let maxDeviation = atonality / 14;
            let maxDetune = atonality % 14;

            fine += randomInt(0, maxDeviation + 1);
            fine = fine % 100

            op_fineTuners[op - 1].value = fine;
            op_deTuners[op - 1].value = randomInt(0, maxDetune + 1);
        }

        // feedback i'm going to give both complexity and brightness a go at. They get a roll of the dice
        // multiple times based on their values. Each roll has a chance to increase feedback.
        let fb = 0;
        for(let i = 20; i < brightness; i+= 20){
            if(randomInt(0, 3) == 2){
                fb += 1
            }
        }
        for(let i = 20; i < complexity; i+= 20){
            if(randomInt(0, 3) == 2){
                fb += 1
            }
        }

        feedbackInput.value = fb;

        // and on to the envelope
        // i'm allowing a little more randomness in here, because the envelope is less likely
        // to ruin a patch as much as the timbre stuff. The timbre was kinda "rules", this is
        // more "guidelines"
        // hardness is attack (so just R1 really), that applies to carriers primarily (but factors into twangness)
        // hitness is the drop from l1 down to l2 - how fast it is (r2) and how far you fall (l2) on a *carrier*
        // twangness is hitness and hardness for modulators wrapped into one - the journey from l4 up to l1 and down to l2.
        //     hitness and hardness will factor into these calculations, but to a lesser degree.
        // longness is l3 levels and r4
        // r3.... that can kinda just be random (with a bit of the other stuff built in I guess)
        for(let op = 1; op <= 6; op++){
            let r1, r2, r3, r4, l1, l2, l3, l4; 
            l1 = 99;  // always
            
            // l4
            if(carriers.includes(op)){
                l4 = 0;  // always for carriers
            }else{
                //hardness and twang needs a lower l4 to get that travel
                l4 = Math.min(0, randomInt(0, 100) - randomInt(0, hardness) - randomInt(0, twang));
            }

            // r1 (hardness, twang)
            // practically, we should consider hardness as a bias around the point where soft and hard kinda live in the
            // envelopes which is about 62, not 50
            let r1Bias = hardness - 62;
            if(carriers.includes(op)){
                // for carriers, this is pure hardness
                r1 = Math.min(99, Math.max(0, 62 + randomInt(Math.min(0, r1Bias - 20), Math.max(20, r1Bias + 20))));
            }else{
                // for modulators, hardness must be tempered by twang
                r1 = Math.min(99, Math.max(0, 62 + randomInt(Math.min(0, r1Bias - 20), Math.max(20, r1Bias + 20)) - randomInt(0, twang/5)));
            }

            // r2 (hitness, twang)
            // we work with that bias again
            let r2Bias = hitness - 62;
            if(carriers.includes(op)){
                // for carriers, this is pure hitness
                r2 = Math.min(99, Math.max(0, 62 + randomInt(Math.min(0, r2Bias - 20), Math.max(20, r2Bias + 20))));
            }else{
                // for modulators, hitness must be tempered by twang
                r2 = Math.min(99, Math.max(0, 62 + randomInt(Math.min(0, r1Bias - 20), Math.max(20, r1Bias + 20)) - randomInt(0, twang/5)));
            }

            // l2 (hitness, twang)
            if(carriers.includes(op)){
                // for carriers, this is pure hitness
                l2 = Math.max(0,  99 - randomInt(0, hitness));
            }else{
                // for modulators, it's hitness and twang
                l2 = Math.max(0,  99 - randomInt(0, hitness / 2) - randomInt(0, twang / 2));
            }

            // r3...probably kinda all of them
            let r3Bias = hardness - 50;
            if(carriers.includes(op)){
                r3 = 50;
                r3 += randomInt(Math.min(0, r3Bias), Math.max(0, r3Bias));
                r3 -= randomInt(0, long / 3);
            }else{
                r3 = 50;
                r3 += randomInt(Math.min(0, r3Bias), Math.max(0, r3Bias));
                r3 -= randomInt(0, long / 6);
                r3 -= randomInt(0, twang / 6);
            }

            // l3 - mostly likely down for carriers, either for modulators.
            if(carriers.includes(op)){
                l3 = randomInt(0, 9) == 8 ? randomInt(l2, 99) : randomInt(0, l2);
            }else{
                l3 = l2 + randomInt(-l2, 99 -l2);
            }

            // r4 - about dat longness
            r4 = 0;
            for(let i = 0; i < 100; i += (long + 1)){
                r4 += randomInt(0, 30);
            }
            
            envelopes[op - 1][0].value = r1;
            envelopes[op - 1][1].value = r2;
            envelopes[op - 1][2].value = r3;
            envelopes[op - 1][3].value = r4;
            envelopes[op - 1][4].value = l1;
            envelopes[op - 1][5].value = l2;
            envelopes[op - 1][6].value = l3;
            envelopes[op - 1][7].value = l4;
        }

        // movement stuff (lfos and velocity)
        // velocity - dice rolls, more likely to modulators
        for(let op = 1; op <= 6; op++){
            let odds = carriers.includes(op) ? 8 : 3;
            let kvs = 0;
            for(let i = 0 ; i < 7; i++){
                if(randomInt(0, odds * 100) < velocity){
                    kvs += 1;
                }
            }
            op_kvs[op - 1].value = kvs;
        }

        // wubble (am)
        // for the operators it's dice rolls as above, but we also need to set
        // the global depth
        for(let op = 1; op <= 6; op++){
            let odds = carriers.includes(op) ? 5 : 3;
            let ams = 0;
            for(let i = 0 ; i < 7; i++){
                if(randomInt(0, odds * 100) < wubble){
                    ams += 1;
                }
            }
            op_am[op - 1].value = ams;
        }

        ampModDepthInput.value = Math.max(0, Math.min(99, wubble + randomInt(-40, 40)));

        // wobble (pitch mod)
        // so this is 2 global parameters pitch mod depth and pitch mod sensitivity.
        // to my ears, each notch on the PMS doubles the sensitivity, so depth 99 on 
        // sensitity 1 is roughly the same as depth 50 on sensitivity 2, which is the
        // same as depth 25 on sensitivity 3, and so on
        // so that basically gives us a pitch mod amount that runs from 0 to 6400 more
        // or less.
        // of course, if the user has the slider set to 0, we don't do anything
        if(wobble > 0){
            // To make the slider even remotely useful though, we need to log scale it:
            let minWobp = 0;
            let maxWobp = 100;

            let minWobv = Math.log(1);
            let maxWobv = Math.log(6400);

            let wobScale = (maxWobv - minWobv) / (maxWobp - minWobp);
            wobbleLog = Math.exp(minWobv + wobScale * (wobble - minWobp));

            let wobbleVarience = 50; // arbitrary, tweak for best results
            let wobbleValue = Math.max(0, Math.min(6400, wobbleLog + randomInt(-wobbleVarience, wobbleVarience)));

            // once we have that value, we work out the most precise place to put it
            let pSensitivty = 1;
            let i = 100;
            while(wobbleValue > i){
                pSensitivty += 1;
                i = 100 * (1 << (pSensitivty - 1));
            }
            let pitchModDepth = wobbleValue / (1 << (pSensitivty - 1));

            pitchModSenseInput.value = pSensitivty;
            pitchModDepthInput.value = pitchModDepth;
        }
        // lfo speed
        // so, my theory here is that there's a sweet spot in the middle which sounds
        // "right" on a lot of patches. Somewhere between 20 and 60. Outside of that it's
        // more "complex" or more "seasick" (wobbly). So i'm going to have stuff pulling in
        // different directions from that sweetspot.

        let lfoSpeed = 40;
        lfoSpeed += randomInt(0, complexity * 0.6);
        lfoSpeed -= randomInt(0, wobble * 0.6);

        // finally, just add some generic, arbitrary randomness, yo
        lfoSpeed += randomInt(-20, 20);
        lfoSpeed = Math.max(0, Math.min(99, lfoSpeed));
        
        lfoSpeedInput.value = lfoSpeed;

        // finally the lfo shape - just down to complexity
        waveShapeInput.value = LFO_SHAPE_COMPLEXITY[Math.floor(randomInt(0, complexity) / LFO_SHAPE_COMPLEXITY.length)];
        
    }

    return randomize;
}