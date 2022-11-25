function salt_loadMinionDisks(minion, disks) {
    $.each(disks, function(name, conf) {
        console.log(conf.capacity);
        var item = $('<div>', {
            class: 'salt_diskItem user navItem no-breaks',
            disk_id: name,
            text: name,
            minion: minion,
            usage_data: btoa(JSON.stringify(conf))
        });
        var meter = $('<div>', {
            class: 'salt_diskItemUsageMeter',
            minion: minion,
            disk_id: name,
            css: {
                'width': conf.capacity
            }
        });
        var icon = $('<img>', {
            class: 'navItemIcon',
            src: '/resource/plugins/salt/assets/minion_disks.png'
        });
        //label.prepend(icon);
        item.prepend(meter, icon);
        $('#salt_disk_nav').append(item);
    });
}

$(document).on('click', '.salt_diskItem', function() {
    var disk = $(this).attr('disk_id');
    var minion = '<?= $minion ?>';
    var usage = JSON.parse(atob($(this).attr('usage_data')));
    $('.salt_diskItem').removeClass('activePage');
    $(this).addClass('activePage');
    $('#salt_diskContent').html('');
    $('#salt_diskTitle').text('Filesystem info');
    var statList = $('<ul>', {
        class: 'objectList'
    });
    var nameItem = $('<li>', {
        class: 'objectItem salt_minionInfoBlock'
    });
    var nameLabel = $('<span>', {
        class: 'salt_statLabel',
        text: 'Filesystem'
    });
    var nameVal = $('<span>', {
        class: 'salt_statValue',
        text: disk
    });
    statList.append(nameItem.append(nameLabel, nameVal));
    $('#salt_diskContent').append(statList);
    $.each(usage, function(statName, statConf) {
        var statItem = $('<li>', {
            class: 'objectItem salt_minionInfoBlock',
            minion: minion,
            stat: statName
        });
        var statLabel = $('<span>', {
            class: 'salt_statLabel',
            text: statName
        });
        var statVal = $('<span>', {
            class: 'salt_statValue',
            text: statConf
        });
        statItem.append(statLabel, statVal);
        statList.append(statItem);
    });
});

$(document).ready(function () {
    $.ajax({
        url: '/api/minions/<?= $minion ?>/disks',
        type: 'GET'
    }).fail(function(err) {
        return false;
    }).done(function(res) {
        $('#salt_minionDisksLoad').remove();
        salt_loadMinionDisks('<?= $minion ?>', res);
        return true;
    })
});