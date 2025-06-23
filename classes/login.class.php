<?php
class Login extends dbHandler
{
    private $type;
    private $username;
    private $password;
    private $userInfo;
    private $response;

    public function __construct($type, $username, $password)
    {
        parent::__construct();
        $this->type = $type;
        $this->username = $username;
        $this->password = $password;
        if (!$this->setUserInfo()) $this->invalidCredentials();
        else $this->validateCredentials();
    }

    private function setUserInfo()
    {
        $query = "SELECT id, password, email, attempt, status FROM $this->type WHERE username='$this->username' OR email='$this->username'";
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            $row = mysqli_fetch_assoc($result);
            $this->userInfo = (object)[
                'id' => $row['id'],
                'email' => $row['email'],
                'password' => $row['password'],
                'attempt' => $row['attempt'],
                'status' => $row['status'],
            ];
            return true;
        } else {
            return false;
        }
    }

    private function validateCredentials()
    {
        if ($this->userInfo->status == BLOCKED && $this->type != ADMIN) {
            $this->response = (object) [
                'status' => false,
                'msg' => 'Too many failed login attempts. Your account has been blocked'
            ];
        } elseif ($this->userInfo->status == DELETED && $this->type != ADMIN) {
            $this->response = (object) [
                'status' => false,
                'msg' => 'Your account has been deleted by the administrator. For account restoration, please contact your administrator.'
            ];
        } elseif ($this->password != $this->userInfo->password) {
            $this->setUserAttempt($this->userInfo->id, $this->userInfo->attempt - 1);
            $this->invalidCredentials();
        } else {
            $this->setUserAttempt($this->userInfo->id, DEFAULT_ATTEMPT);
            $_SESSION[$this->type] = $this->userInfo->id;
            $this->response = (object) [
                'status' => true,
                'msg' => ''
            ];
        }
    }

    private function invalidCredentials()
    {
        $this->response = (object) [
            'status' => false,
            'msg' => 'Incorrect Username or Password!'
        ];
    }

    private function setUserAttempt($id, $attempt)
    {
        if ($this->type === ADMIN) return true;
        $query = "UPDATE $this->type SET attempt='$attempt', status='" . ACTIVE . "' where id='$id'";
        if ($attempt == 0) $query = "UPDATE $this->type SET attempt='$attempt', status='" . BLOCKED . "' where id='$id'";
        return mysqli_query($this->conn, $query);
    }

    public function getResponse()
    {
        return $this->response;
    }
}  // End of Login class
