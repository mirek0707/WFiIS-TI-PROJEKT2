<?php
//require 'vendor/autoload.php';
class db
{
    private $user = "9kolodziejmir" ;
    private $pass = "pass9kolodziejmir";
    private $host = "172.20.44.25";
    private $base = "9kolodziejmir";

    private $usersCollName = "users";
    private $sessionCollName = "session";
    private $surveyCollName = "survey";
    private $conn;
    private $dbase;
    private $usersColl;
	  private $sessionColl;
	  private $surveyColl;

    function __construct()
    {
      $this->conn = new MongoDB\Client("mongodb://{$this->user}:{$this->pass}@{$this->host}/{$this->base}"); 

      $this->usersColl = $this->conn->{$this->base}->{$this->usersCollName};
      $this->sessionColl = $this->conn->{$this->base}->{$this->sessionCollName};
      $this->surveyColl	 = $this->conn->{$this->base}->{$this->surveyCollName}; 
    }

    function survey($data)
    {
      $res = $this->surveyColl->insertOne($data) ;
      return $res;
    }

    function getdata()
    {
      $cursor = $this->surveyColl->find();
      $table = iterator_to_array($cursor);
      return $table ;
    }

    function register($user)
    {	
      $tmp =	$this->usersColl->findOne(array("login" => $user['login']));
      if($tmp == null)
        $res = $this->usersColl->insertOne($user);
      else
        return false;
      return $res;
    }

    function login($user)
    {
      $login = $user['login'];
      $pass = $user['pass'];
      $tmp =	$this->usersColl->findOne(array("login" => $login, "pass" => $pass));
      if($tmp != null)
      {
        $sess_id = md5(uniqid($login, true));
        $start_time = date('Y-m-d H:i:s', time());
        $res = $this->sessionColl->insertOne(array("sessionID" => $sess_id, "start" => $start_time));
      }
      return $sess_id;
    }
    
    function logout($sess)
    {
      $tmp =	$this->sessionColl->findOne(array('sessionID' => $sess));
      if($tmp != null)
      {
        $this->sessionColl->deleteOne(array('sessionID' => $sess));
      }
      else
        return false;
      return true;
    }

    function session($arr)
    {
      $temp =  $this->sessionColl->findOne(array('sessionID' => $arr['sessionID']));
      if ($temp != NULL) {
        $czasp = $temp['start'];
        $datap = DateTime::createFromFormat("Y-m-d H:i:s", $czasp);
        $datak = new DateTime('now');
        $czasTrwania = $datak->getTimestamp() - $datap->getTimestamp();

        if ($czasTrwania > (10 * 60)) {
          $this->sessionColl->remove(array('sessionID' => $arr['sessionID']));
          return false;
        }
      } 
      else {
        return false;
      }
      return true;
    }
}

?>
