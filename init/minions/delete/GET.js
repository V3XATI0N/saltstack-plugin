$(document).ready(function () {
    var grains = grainStore('<?= $minion ?>');
    $('.salt_minionModPageLink[minion="'+$.escapeSelector('<?= $minion ?>')+'"][offline_only="true"]').show(0);
    $('.salt_minionModPageLink[minion="'+$.escapeSelector('<?= $minion ?>')+'"][online_only="true"]').hide(0);
    pingMinion('<?= $minion ?>')
    .then(() => {
        $('#salt_deleteMinion_title').text('<?= $minion ?> is ONLINE. You probably should not delete it.');
        $('#salt_deleteMinion').hide(0);
        $('.salt_minionPage_infoIcon').attr({'src': '/resource/plugins/salt/assets/minion_connected.png'});
        $('.salt_minionModPageLink[minion="'+$.escapeSelector('<?= $minion ?>')+'"][offline_only="true"]').hide(0);
        $('.salt_minionModPageLink[minion="'+$.escapeSelector('<?= $minion ?>')+'"][online_only="true"]').show(0);
    })
    .catch(() => {
        $('#salt_deleteMinion_title').html('<?= $minion ?> is <strong>OFFLINE</strong>. Do you want to remove it from your configuration?');
        $('#salt_deleteMinion').show(0);
        $('.salt_minionPage_infoIcon').attr({'src': '/resource/plugins/salt/assets/minion_disconnected.png'});
        $('.salt_minionModPageLink[minion="'+$.escapeSelector('<?= $minion ?>')+'"][offline_only="true"]').show(0);
        $('.salt_minionModPageLink[minion="'+$.escapeSelector('<?= $minion ?>')+'"][online_only="true"]').hide(0);
    })
});
