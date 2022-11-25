<?php
if (empty($api_path[2])) {
    ?>
    <div class="pageHeader">Minions</div>
    <div id="salt_minionListMain">
        <div class="loading_place"></div>
    </div>
    <script type="text/javascript">
    $(document).ready(function () {
        setTimeout(function() {
            listMinionsMain();
        }, 200);
    });
    </script>
    <?php
} else {
    $minion = $api_path[2];
    ?>
    <div class="pageHeader" id="salt_minionPageHeader"><a href="/minions">Minions</a><span> › </span><?= $minion ?></div>
    <div id="minionContent" minion="<?= $minion ?>">
        <div class="loading_place"></div>
    </div>
    <script type="text/javascript">
    $(document).ready(function () {
        setTimeout(function() {
            <?php if (empty($api_path[3])) { ?>
            getMinionPage('<?= $minion ?>');
            <?php } else { ?>
            getMinionPage('<?= $minion ?>', '<?= $api_path[3] ?>')
            <?php } ?>
        }, 200);
    });
    </script>
    <?php
}