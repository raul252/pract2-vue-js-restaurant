<?php
require_once('process.php');
$valor = $_POST;
$process = new Process();
$data = null;
if (isset($_GET['method']) && $_GET['method'] == 'getRows') {
    //Obtener los datos de la tabla
    $data = $process->getRows();
} elseif (isset($_GET['method']) && $_GET['method'] == 'getNewRows') {
    //Obtener los datos de la tabla
    $data = $process->getNewRows();
} elseif (isset($_GET['method']) && $_GET['method'] == 'getNews') {
    //Obtener de las actualizaciones de la tabla
    $data = $process->getNews();
} elseif (isset($_GET['method']) && $_GET['method'] == 'getRow' && isset($_GET['id']) && $_GET['id'] > 0) {
    //Obtener los datos de una fila de tabla
    $id = $_GET['id'];
    $data = $process->getRow($id);
} elseif (isset($_POST['method']) && $_POST['method'] == 'deleteRow' && isset($_POST['id']) && $_POST['id'] > 0) {
    //Obtener datos para borrar fila en la tabla
    $id = $_POST['id'];
    $data = $process->deleteRow($id);
} elseif (isset($_POST['method']) && $_POST['method'] == 'processForm') {
    //Obtener los datos para insert/update
    $params = $_POST['data'];
    $data = $process->processRow($params);
}
echo json_encode($data);
?>