$(document).ready(function () {
    var grains = grainStore('<?= $minion ?>');
    $('.salt_minionNewUserButton[minion="<?= $minion ?>"]').attr('kernel', grains.kernel);
    salt_loadMinionModPage('<?= $minion ?>', 'users');
});