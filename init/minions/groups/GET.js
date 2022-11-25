$(document).ready(function () {
    var grains = grainStore('<?= $minion ?>');
    $('.salt_minionNewGroupButton[minion="<?= $minion ?>"]').attr('kernel', grains.kernel);
    salt_loadMinionModPage('<?= $minion ?>', 'groups');
});
