<?php
class Process {
    /**
     * GetConnection
     * Función que obtiene una connection string
     */
    private function getConnection() {
        //Production credentials
        $host = "localhost";
        $user = "root";
        $password = "";
        $db = "restauranteuoc";
        $port = "3306";
        $connection = mysqli_connect($host, $user, $password, $db, $port);
        if ($connection) {
            $connection->set_charset("utf8");
            return $connection;
        } else {
            return null;
        }
    }

    
    /*
    * getNews
    * Función para saber si hay reservas en las próximas 24h
    */
    public function getNews() {
        //Array para el json de los datos
        $data = [];
        //Abrir la conexión
        $connection = $this-> getConnection();
        if ($connection) {
            $stmt = $connection->prepare("SELECT * FROM reservas WHERE fecha >= NOW() AND fecha <= NOW() + INTERVAL 1 DAY");
            $stmt->execute();
            $result = $stmt->get_result();
            $numRows = $result->num_rows;
            if ($numRows > 0) {
                $data['new']=true;
            } else {
                $data['new']=false;
            }
        }
        $this->cerrar($connection);
        return $data;
    }

      /*
    * getNews
    * Función para Obtener reservan en las próximas 24 h
    */
    public function getNewRows() {
        //Array para el json de los datos
        $data = [];
        //Abrir la conexión
        $connection = $this-> getConnection();
        if ($connection) {
            //Select de los datos en las próximas 24h
            $stmt = $connection->prepare("SELECT * FROM reservas WHERE fecha >= NOW() AND fecha <= NOW() + INTERVAL 1 DAY ORDER by fecha ASC");
            $stmt->execute();
            $result = $stmt->get_result();
            while ($fila = mysqli_fetch_assoc($result)) {
                if (isset($fila['fecha'])) {
                    $row['id'] = $fila['id'];
                }
                if (isset($fila['nombre'])) {
                $row['nombre'] = $fila['nombre'];
                }
                if (isset($fila['apellidos'])) {
                $row['apellidos'] = $fila['apellidos'];
                }
                if (isset($fila['telefono'])) {
                $row['telefono'] = $fila['telefono'];
                }
                if ($this->validateDate($fila['fecha'])) {
                    $row['fecha'] = date("d/m/Y H:i", strtotime($fila['fecha']));
                }
                if (isset($fila['comensales'])) {
                $row['comensales'] = $fila['comensales'];
                }
                if (isset($fila['comentarios'])) {
                $row['comentarios'] = $fila['comentarios'];
                }
                $data[] = $row;
            }
        }
        $this->cerrar($connection);
        return $data;
    }

    /*
    * getRows
    * Función para obtener reservas futuras
    */
    public function getRows() {
        //Array para el json de los datos
        $data = [];
        //Abrir la conexión
        $connection = $this-> getConnection();
        if ($connection) {
            $stmt = $connection->prepare("SELECT * FROM reservas WHERE fecha >= CURDATE() ORDER by fecha ASC");
            $stmt->execute();
            $result = $stmt->get_result();
            while ($fila = mysqli_fetch_assoc($result)) {
                if (isset($fila['fecha'])) {
                    $row['id'] = $fila['id'];
                }
                if (isset($fila['nombre'])) {
                $row['nombre'] = $fila['nombre'];
                }
                if (isset($fila['apellidos'])) {
                $row['apellidos'] = $fila['apellidos'];
                }
                if (isset($fila['telefono'])) {
                $row['telefono'] = $fila['telefono'];
                }
                if ($this->validateDate($fila['fecha'])) {
                    $row['fecha'] = date("d/m/Y H:i", strtotime($fila['fecha']));
                }
                if (isset($fila['comensales'])) {
                $row['comensales'] = $fila['comensales'];
                }
                if (isset($fila['comentarios'])) {
                $row['comentarios'] = $fila['comentarios'];
                }
                $data[] = $row;
            }
        }
        $this->cerrar($connection);
        return $data;
    }

    
    /*
    * getRow
    * @param $id
    * Función para obtener un row por id
    */
    public function getRow($id) {
        //Array para el json de los datos
        $data = [];
        //Abrir la conexión
        $connection = $this-> getConnection();
        if ($connection) {
            $stmt = $connection->prepare("SELECT * FROM reservas WHERE id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $fila = $result->fetch_assoc();

            $id = '';
            $nombre = '';
            $apellidos  = '';
            $telefono  = '';
            $fecha  = '';
            $comensales  = '';
            $comentarios  = '';
            if (isset($fila['id'])) {
            $id = $fila['id'];
            }
            if (isset($fila['nombre'])) {
            $nombre = $fila['nombre'];
            }
            if (isset($fila['apellidos'])) {
            $apellidos = $fila['apellidos'];
            }
            if (isset($fila['telefono'])) {
            $telefono = $fila['telefono'];
            }
            if ($this->validateDate($fila['fecha'])) {
            $fecha = date("d/m/Y H:i", strtotime($fila['fecha']));
            }
            if (isset($fila['comensales'])) {
            $comensales = $fila['comensales'];
            }
            if (isset($fila['comentarios'])) {
            $comentarios = $fila['comentarios'];
            }
            $row['id'] = $id;
            $row['nombre'] = $nombre;
            $row['apellidos'] = $apellidos;
            $row['telefono'] = $telefono;
            $row['fecha'] = $fecha;
            $row['comensales'] = $comensales;
            $row['comentarios'] = $comentarios;
            $data = $row;
            
        }
        $this->cerrar($connection);
        return $data;
    }

        /*
    * getRow
    * @param $id
    * Borrar una row
    */
    public function deleteRow($id) {
        //Array para el json de los datos
        $data = [];
        //Abrir la conexión
        $connection = $this-> getConnection();
        if ($connection) {
            $stmt = $connection->prepare("DELETE FROM reservas WHERE id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
            if($stmt->affected_rows > 0){
                $data['ok'] = true;
            } else {
                $data['ok'] = false;
            }
        }
        $this->cerrar($connection);
        return $data;
    }

    /*
    * getRow
    * @param $params
    * Función para Insert/Update
    */
    public function processRow($params) {
        //Array para el json de los datos
        $data = [];
        $error = false;
        //Validación en el server
        if (!in_array($params['comensales'], range(1,10))) {
            $data['ok'] = false;
            $data['message'] = 'El número de comensales no está entre 1 y 10.';
            return $data;
        }
        //Validar la fecha en el cliente
        $cadenaDate = $params['year'].'-'.$params['mes'].'-'.$params['dia'].' '.$params['hora'].':'.$params['minuto'];
        if (!$this->validateDate($cadenaDate, 'Y-m-d H:i')) {
            $data['ok'] = false;
            $data['message'] = 'La fecha no es válida.';
            return $data;
        }
        $fecha = DateTime::createFromFormat('Y-m-d H:i', $cadenaDate)->format('Y-m-d H:i');
        //Abrir la conexión
        $connection = $this-> getConnection();
        if ($connection) {
            if ($params['id'] > 0) {
                //Update reserva
                $sql = "UPDATE `reservas` SET 
                    `nombre` = ?, 
                    `apellidos` = ?,
                    `telefono` = ?,
                    `fecha` = ?,
                    `comensales` = ?,
                    `comentarios` = ?
                    WHERE id=?";
                    $stmt = $connection->prepare($sql);
                    $stmt->bind_param("ssssssi", $params['nombre'], $params['apellidos'], $params['telefono'], $fecha, $params['comensales'],
                    $params['comentarios'],
                    $params['id']);
                    $status = $stmt->execute();
                    if($status !== false){
                        $data['ok'] = true;
                        $data['message'] = 'Datos actualizados correctamente.';
                    } else {
                        $data['ok'] = false;
                        $data['message'] = 'Error al actualizar los datos.';
                    }
            } else {
                //Insertar nueva reserva si la fecha es superior en 24h a la actual
                $datetimeReserva = new DateTime($cadenaDate);
                $datetimeNow = new DateTime();
                $difference = $datetimeReserva->diff($datetimeNow);
                if ($difference->d < 1 && ($difference->y == 0)) {
                    $data['ok'] = false;
                    $data['message'] = 'La fecha de reserva no es superior en 24h a la fecha actual.';
                    return $data;
                }
                //Insert reserva
                $values = '?, ?, ?, ?, ?, ?';
                $sql = "INSERT INTO `reservas` (
                `nombre`, 
                `apellidos`,
                `telefono`,
                `fecha`,
                `comensales`,
                `comentarios`
                )
                VALUES ($values)";
                $stmt = $connection->prepare($sql);
                $stmt->bind_param("ssssss", $params['nombre'], $params['apellidos'], $params['telefono'], $fecha, $params['comensales'],
                $params['comentarios']);
                $stmt->execute();
                if($stmt->affected_rows > 0){
                    $data['ok'] = true;
                    $data['message'] = 'Datos insertados correctamente.';
                } else {
                    $data['ok'] = false;
                    $data['message'] = 'Error al insertar los datos.';
                }
            }
        }
        $this->cerrar($connection);
        return $data;
    }

    /**
     * @param $date
     * @param $format
     * Función para validar una fecha según un formato
     */
    private function validateDate($date, $format = 'Y-m-d H:i:s')
    {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }

    /**
     * @param $connection
     * Función para cerra conexión
     */
    private function cerrar($connection)
    {
        if ($connection) {
            mysqli_close($connection);
        }
    }
}
?>