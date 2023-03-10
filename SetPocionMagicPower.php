<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];
    $_tipo = $_POST['tipo'];
    $_poder = $_POST['poder'];
    $_pos = $_POST['pos'];
    
    $sth = $dbh->prepare('SELECT `ID` FROM `PotionSeller_db` WHERE `WalletAddress` = :usuario');
    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
    $sth->execute();
    
    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    $output = "";

    if (count($result) > 0) 
    {
        //IDPociones IDUsuario TipoPocion Power Posicion Estado

        $_ID = $result[0]['ID'];
        $sth = $dbh->prepare('INSERT INTO PocionesMagicPower (IDUsuario, TipoPocion, Power, Posicion) 
        VALUES (:IDUsuario, :tipo, :poder, :$pos)');
        $sth->bindParam(':IDUsuario', $_ID, PDO::PARAM_INT);
        $sth->bindParam(':tipo', $_tipo, PDO::PARAM_INT);
        $sth->bindParam(':poder', $_poder, PDO::PARAM_STR);
        $sth->bindParam(':pos', $_pos, PDO::PARAM_INT);
        $sth->execute();

        $new = $dbh->lastInsertId();
        echo $new;
    }
    else
    {
        echo 'no se encontro el usuario!';
    }
    $dbh->commit();
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>
