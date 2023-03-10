<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
    
    $_id = $_POST['id'];
    $_pos = $_POST['pos'];
    $_state = (int)$_POST['state'];
    
    $sth = $dbh->prepare('SELECT * FROM `PocionesMagicPower` WHERE `IDPociones` = :IDPociones');   
    $sth->bindParam(':IDPociones', $_id, PDO::PARAM_INT);
    $sth->execute(); 

    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    
    if (count($result) > 0) 
    {
        $sth = $dbh->prepare('UPDATE `PocionesMagicPower` 
        SET `Estado` = :Estado,`Posicion` = :Posicion WHERE `IDPociones` = :IDPociones');
        $sth->bindParam(':Estado', $_state, PDO::PARAM_INT);
        $sth->bindParam(':Posicion', $_pos, PDO::PARAM_INT);
        $sth->bindParam(':IDPociones', $_id, PDO::PARAM_INT);
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
