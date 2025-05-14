<?php

require_once "../Model/Database.php";  // Asegúrate de que esta clase usa mysqli

// Crear una nueva instancia de Conexion
$conexion = new Conexion();

// Ejecutar la consulta para obtener los usuarios
$sql = "SELECT * FROM usuarios";
$resultado = $conexion->conn->query($sql);

// Verificar si la consulta fue exitosa
$usuarios = [];

if ($resultado && $resultado->num_rows > 0) {
    while ($fila = $resultado->fetch_assoc()) {
        $usuarios[] = $fila;
    }
}

// Devolver los usuarios en formato JSON
echo json_encode($usuarios);
?>
