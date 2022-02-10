<?php
  
require '../vendor/autoload.php' ;		  
require_once("rest.php");
require_once("mongo.php");
        
class API extends REST 
{
    public $data = "";

    public function __construct()
    {
        parent::__construct();				// Init parent contructor
            $this->db = new db() ;		// Initiate Database
    }

    public function processApi()
	{
		$func = "_".$this->_endpoint ; 
		
		if((int)method_exists($this,$func) > 0)
			$this->$func();
		else 
			$this->response('Page not found',404);	 
	}

	private function _register()
	{
		if($this->get_request_method() != "POST")
			$this->response('',406);
		if(!empty($this->_request) )
		{
			try{
				$json_array = json_decode($this->_request,true);
				
				foreach ($json_array as $key => $value)
				{
					if ($value == '')
					{
						$result = array('status' => 'failed', 'msg' => 'Data missed');
						$this->response($this->json($result), 400);
					}
				}
				$res = $this->db->register($json_array);
				if ( $res )
				{
					$result = array('status' => 'ok');
					$this->response($this->json($result), 200);
				} 
				else
				{
					$result = array('status' => 'Login already taken');
					$this->response($this->json($result), 200);
				}	 
			} 
			catch (Exception $e) 
			{
				$error = array('status' => "failed", "msg" => "Exception thrown");
				$this->response('', 400);
			}
		} 
		else 
		{
			$error = array('status' => "failed", "msg" => "Invalid send data");
			$this->response($this->json($error), 400);
		}
	}

	private function _login()
	{
		if($this->get_request_method() != "POST")
			$this->response('',406);
		if( !empty($this->_request) )
		{
			try{
				$json_array = json_decode($this->_request,true);
				
				foreach ($json_array as $key => $value)
				{
					if ($value == '')
					{
						$result = array('status' => 'failed', 'msg' => 'Data missed');
						$this->response($this->json($result), 400);
					}
				}
				$res = $this->db->login($json_array);
				if ( $res )
				{
					$result = array('status' => 'ok', 'sessionID'=>$res);
					$this->response($this->json($result), 200);
				} 
				else
				{
					$result = array('status'=>'Validation fail');
					$this->response($this->json($result), 200);
				} 
			} 
			catch (Exception $e)
			{
				$error = array('status' => "failed", "msg" => "Exception thrown");
				$this->response('', 400);
			}
		} 
		else 
		{
			$error = array('status' => "failed", "msg" => "Invalid send data");
			$this->response($this->json($error), 400);
		}	
	}

    private function _logout()
	{
		if($this->get_request_method() != "POST")
			$this->response('',406);
		if(!empty($this->_request))
		{
			try{
				$json_array = json_decode($this->_request,true);
				$res = $this->db->logout($json_array['sessionID']) ;			
				if ( $res )
				{
					$result = array('status'=>'ok');
					$this->response($this->json($result), 200);
				} 
				else
				{
					$result = array('status'=>'wrong sessionID');
					$this->response($this->json($result), 200);
				} 
			} 
			catch (Exception $e)
			{
				$this->response('', 400) ;
			}  
		}
		else
		{
			$error = array('status' => "failed", "msg" => "Session failed");
			$this->response($this->json($error), 400);
		} 
	}

    private function _session()
    {
        if ($this->get_request_method() != "POST")
            $this->response('', 406);

        if (!empty($this->_request)) {
            try {
                $jsonArr = json_decode($this->_request, true);
                foreach ($jsonArr as $key => $val) {
                    if ($val == '') {
                        $res = array('status' => 'failed', 'msg' => 'Missing data');
                        $this->response($this->json($res), 400);
                    }
                }
                //stan sesji
                $ses = $this->database->session($jsonArr);
                if ($ses) {
                    $res = array('status' => 'ok');
                    $this->response($this->json($res), 200);
                } else {
                    $res = array('status' => 'Invalid session');
                    $this->response($this->json($res), 200);
                }
            } catch (Exception $e) {
                $err = array('status' => "failed", "msg" => "Exception thrown");
                $this->response('', 400);
            }
        } else {
            $err = array('status' => "failed", "msg" => "Invalid data");
            $this->response($this->json($err), 400);
        }
    }

    private function _survey() 
	{
		if($this->get_request_method() != "POST") {
			$this->response('',406);
		}
 
		if(!empty($this->_request) )
		{
			try{
			   $json_array = json_decode($this->_request,true);
			   $res = $this->db->survey($json_array);

			   if ( $res )
			   {
				$result = array('status' => 'ok');
				$this->response($this->json($result), 200);
				} 
				else
				{
					$result = array('status'=>'Validation fail');
					$this->response($this->json($result), 200);
				} 
			} 
			catch (Exception $e)
			{
				$error = array('status' => "failed", "msg" => "Exception thrown");
				$this->response('', 400);
			}
		} 
		else
		{
			$error = array('status' => "failed", "msg" => "Invalid send data");
			$this->response($this->json($error), 400);
		}  
	} 
 
	private function _getdata()
	{	
		if($this->get_request_method() != "GET")
		{
			$this->response('',406);
		}
		$result = $this->db->getdata() ;			
		$this->response($this->json($result), 200); 
	}


 
	private function json($data)
	{
		if(is_array($data))
			return json_encode($data);
	}
}

$api = new API;
$api->processApi();
?>