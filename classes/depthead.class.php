<?php
class depthead extends dbHandler
{
    private $id;
    private $deptheadInfo;

    public function __construct($id)
    {
        parent::__construct();
        $this->id = $id;
        $query = "SELECT username, email, password FROM depthead WHERE id=$id";
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            $row = mysqli_fetch_assoc($result);
            $this->deptheadInfo = (object)[
                'username' => $row['username'],
                'email' => $row['email'],
                'password' => $row['password'],
                'username' => $row['username']
            ];
        } 
    } 

    public function getInfo() {
        return $this->deptheadInfo;
    }

    public function setInfo($info) {
        $query = "UPDATE depthead SET username='$info->username', email='$info->email' WHERE id='$this->id'";
        return array("status" => mysqli_query($this->conn, $query));
    }

    public function setPassword($password) {
        $query = "UPDATE depthead SET password='$password' WHERE id='$this->id'";
        return mysqli_query($this->conn, $query);
    }

}
