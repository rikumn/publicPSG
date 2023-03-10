<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->beginTransaction();
    
    /*$_id = $_POST['id'];
    $_pos = $_POST['pos'];
    $_state = $_POST['state'];
    */
    $_array = explode(";", $_POST['data']);

   
    for($i = 0; $i < count($_array); ++$i){
        $_sectin = explode(",", $_array[$i]);
        $_id = $_sectin[0];
        $_pos = $_sectin[1];
        $_state = $_sectin[2];
        $sth = $dbh->prepare('UPDATE `PocionesMagicPower` SET `Estado` = '.$_state.',`Posicion` = '.$_pos.' WHERE IDPociones = '. $_id);
        $sth->execute(); 
        echo 'existe!';
    }
    
    
    $dbh->commit();
    echo count($result);
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>