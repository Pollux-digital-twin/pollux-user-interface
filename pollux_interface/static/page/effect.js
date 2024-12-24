var current_effect = 'roundBounce'; //

function run_waitMe(effect){
    $('#container').waitMe({
        effect: effect,
        text: 'Please waiting...',
        bg: 'rgba(255,255,255,0.7)',
        color:'#000'
    });
}
