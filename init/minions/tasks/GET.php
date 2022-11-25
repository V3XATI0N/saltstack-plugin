<?php
$grains = getMinionFromCache($minion);
?>
<div class="adminContentCatch headerOnPage" id="salt_minionTasksContent">
    <?php
    if ($grains['kernel'] != "Windows") {
        ?>
        <ul class="objectList formInputList hide_til_load" context="minion_tasks_user">
            <li class="objectItem formInputListItem">
                <label class="objectItemLabel standardWidth" for="salt_minionTasks_userSelect">Select User:</label>
                <select id="salt_minionTasks_userSelect" minion="<?= $minion ?>">
                    <option disabled="disabled" selected="selected" value="">Select User...</option>
                </select>
            </li>
        </ul>
        <?php
    }
    ?>
    <div id="tasks_wait" class="loading_place"></div>
    <div class="hide_til_load" context="minion_tasks">

        <?php
        if ($grains['kernel'] == "Windows") {
            $group = "all";
            $groupName = "Scheduled Tasks"
            ?>
            <div class="adminNewObjectToolbar">
                <input type="text" placeholder="Filter Tasks" list_id="minion_tasks_list_<?= $group ?>" class="objectListFilter allowFormInputList">
                <?php
                if ($group != "pre") {
                    ?>
                    <button class="salt_minionTasks_newTask" task_group="<?= $group ?>" kernel="<?= $grains['kernel'] ?>" minion="<?= $minion ?>">
                        <img class="buttonIcon" src="/resource/white_plus.png">
                        New...
                    </button>
                    <?php
                }
                ?>
            </div>
            <ul minion="<?= $minion ?>" class="objectList minion_tasks_list" id="minion_tasks_list_<?= $group ?>" task_group="<?= $group ?>"></ul>
            <?php
        } else {
            foreach (['pre'=>'Unmanaged Tasks', 'crons'=>'Scheduled Tasks', 'special'=>'Special Events', 'env'=>'Environment Variables'] as $group => $groupName) {
                ?>
                <h3 class="multiListTitle sectionTrigger" section_class=".minion_task_group" item_id="<?= $group ?>"><?= $groupName ?></h3>
                <div class="sectionAction minion_task_group" item_id="<?= $group ?>">
                    <div class="adminNewObjectToolbar">
                        <input type="text" placeholder="Filter Tasks" list_id="minion_tasks_list_<?= $group ?>" class="objectListFilter allowFormInputList">
                        <?php
                        if ($group != "pre") {
                            ?>
                            <button class="salt_minionTasks_newTask" task_group="<?= $group ?>" kernel="<?= $grains['kernel'] ?>" minion="<?= $minion ?>">
                                <img class="buttonIcon" src="/resource/white_plus.png">
                                New...
                            </button>
                            <?php
                        }
                        ?>
                    </div>
                    <ul minion="<?= $minion ?>" class="objectList minion_tasks_list" id="minion_tasks_list_<?= $group ?>" task_group="<?= $group ?>"></ul>
                </div>
                <?php
            }
        }
        ?>
    </div>
</div>