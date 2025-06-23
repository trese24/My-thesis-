<?php
class dbHandler
{
    public $conn;
    
    public function __construct()
    {
        $this->conn = new mysqli("localhost", "root", "", "gradingmanagementsystem");
        if ($this->conn->connect_error) {
            die("Connection failed: " . $this->conn->connect_error);
        } 
    }

    function __destruct()
    {
        $this->conn->close();
    }
}  // End of dbHandler class
