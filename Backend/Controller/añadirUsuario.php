<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once "../Model/Database.php"; // Asegúrate de que Conexion usa mysqli

$conexion = new Conexion();
$conn = $conexion->conn;

// Recoger datos enviados en el cuerpo POST (JSON)
$datos = json_decode(file_get_contents("php://input"), true);

$nombre = $datos["nombre"] ?? null;

if ($nombre) {
    // Fecha actual del servidor
    $fecha = date("Y-m-d");

    $sql = "INSERT INTO usuarios (nombre, fecha) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $nombre, $fecha);

    if ($stmt->execute()) {
        echo json_encode(["mensaje" => "Usuario añadido correctamente"]);
    } else {
        echo json_encode(["error" => "Error al insertar: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["error" => "Falta el nombre"]);
}

$conn->close();
?>
