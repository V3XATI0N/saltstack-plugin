$(document).ready(function () {
    salt_loadMinionModPage('<?= $minion ?>', 'shell');
    $('#salt_minionShellCmdInput').focus();
});