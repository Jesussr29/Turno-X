<?php
$origenPermitido = $_SERVER['HTTP_ORIGIN'] ?? '';
$origenesValidos = [
    "http://localhost:5173",
    "https://jesussr29.github.io"
];

if (in_array($origenPermitido, $origenesValidos)) {
    header("Access-Control-Allow-Origin: $origenPermitido");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
}


class Conexion {
    public $conn;

    public function __construct() {
        $host = "localhost";
        $db = "rinconj_general";
        $usuario = "rinconj";
        $contrasena = "rInconj7";

        // Conexión a MySQL usando MySQLi
        $this->conn = new mysqli($host, $usuario, $contrasena, $db);

        // Comprobamos si hubo error
        if ($this->conn->connect_error) {
            die("Error de conexión: " . $this->conn->connect_error);
        }

        // Opcional: establecer codificación de caracteres
        $this->conn->set_charset("utf8");
    }


}





?>
