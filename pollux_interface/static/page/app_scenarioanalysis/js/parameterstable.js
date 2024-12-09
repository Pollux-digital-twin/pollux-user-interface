
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
    if (e.target.hash == '#tab_heatpipe' || e.target.hash == '#tab_heatparameter') {
        $('#data-table-heatpipe').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_heatheatexchanger' || e.target.hash == '#tab_heatparameter') {
        $('#data-table-heatheatexchanger').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_heatheatpump' || e.target.hash == '#tab_heatparameter') {
        $('#data-table-heatheatpump').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_heatbuffer' || e.target.hash == '#tab_heatparameter') {
        $('#data-table-heatbuffer').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_heatproducer' || e.target.hash == '#tab_heatparameter') {
        $('#data-table-heatproducer').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_heatconsumer' || e.target.hash == '#tab_heatparameter') {
        $('#data-table-heatconsumer').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_gaspipe' || e.target.hash == '#tab_gasparameter') {
        $('#data-table-gaspipe').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_gasreducer' || e.target.hash == '#tab_gasparameter') {
        $('#data-table-gasreducer').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_gascompressor' || e.target.hash == '#tab_gasparameter') {
        $('#data-table-gascompressor').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_gasproducer' || e.target.hash == '#tab_gasparameter') {
        $('#data-table-gasproducer').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_gasconsumer' || e.target.hash == '#tab_gasparameter') {
        $('#data-table-gasconsumer').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_gasstorage' || e.target.hash == '#tab_gasparameter') {
        $('#data-table-gasstorage').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_gaspower2gas' || e.target.hash == '#tab_gasparameter') {
        $('#data-table-gaspower2gas').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_gasgas2power' || e.target.hash == '#tab_gasparameter') {
        $('#data-table-gasgas2power').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_electricityline' || e.target.hash == '#tab_electricityparameter') {
        $('#data-table-electricityline').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_electricitybus' || e.target.hash == '#tab_electricityparameter') {
        $('#data-table-electricitybus').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_electricitytransformer' || e.target.hash == '#tab_electricityparameter') {
        $('#data-table-electricitytransformer').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_electricityproducer' || e.target.hash == '#tab_electricityparameter') {
        $('#data-table-electricityproducer').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_electricityconsumer' || e.target.hash == '#tab_electricityparameter') {
        $('#data-table-electricityconsumer').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_electricitypower2gas' || e.target.hash == '#tab_electricityparameter') {
        $('#data-table-electricitypower2gas').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_electricitygas2power' || e.target.hash == '#tab_electricityparameter') {
        $('#data-table-electricitygas2power').DataTable().columns.adjust().draw()
    }
    if (e.target.hash == '#tab_electricitystorage' || e.target.hash == '#tab_electricityparameter') {
        $('#data-table-electricitystorage').DataTable().columns.adjust().draw()
    }

})

function clearTableParameter() {
    tablename_list = [
        '#electrolyser_parameters',
        '#hydrogen_storage_parameters',
        '#input_profiles',
        '#control_parameters'
    ]

    for (var i = 0; i < tablename_list.length; i++) {
        $(tablename_list[i]).DataTable().columns.adjust().clear()
        $(tablename_list[i]).DataTable().columns.adjust().draw()
    }

}