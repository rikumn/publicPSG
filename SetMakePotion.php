<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];
    $_data = $_POST['data'];
    $TipoFraude = [];
    
    $sth = $dbh->prepare('SELECT * FROM `PotionSeller_db` WHERE `WalletAddress` = :usuario');
    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
    $sth->execute(); 

    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    
    if (count($result) > 0 && $_data != null && $_data != "")
    {
        $fraude = FALSE;
        $potionBought = array(0,0,0,0,0,0);
        $items_usados = array(0,0,0,0,0,0);

        echo 'existe!';

        if ( $_data == null)
        {
            //$_data = NULL;
        }
        else
        {
            //Data de JS (con cambios)
            //id_vendedor, id_item, precio, cantidad - ventasJS
            //0,0,5; 1,2,5; 2,4,10
            $lineaJS = explode(";", $_POST['data']);
            $rodosJS = $lineaJS[0];
            $itemsJS = explode(",", $lineaJS[1]);
            $potionsJS = explode(",", $lineaJS[2]);
            
            //Data de DB (sin cambios)
            $lineaDB = explode(";", $result[0]['Data']);
            $rodosDB = $lineaDB[0];
            $itemsDB = explode(",", $lineaDB[1]);
            $potionsDB = explode(",", $lineaDB[2]);

            if ($rodosJS == $rodosDB)
            {
                for ($i = 0; $i < count($potionBought); $i++) {

                    $potionBought[$i] = $potionsJS[$i] - $potionsDB[$i];
                    
                    if ($i == 0) { $items_usados[0] += 5 * $potionBought[$i];
                                   $items_usados[1] += 2 * $potionBought[$i]; }
                    if ($i == 1) { $items_usados[0] += 5 * $potionBought[$i];
                                   $items_usados[3] += 2 * $potionBought[$i]; }
                    if ($i == 2) { $items_usados[1] += 5 * $potionBought[$i];
                                   $items_usados[4] += 2 * $potionBought[$i]; }
                    if ($i == 3) { $items_usados[0] += 3 * $potionBought[$i];
                                   $items_usados[1] += 3 * $potionBought[$i];
                                   $items_usados[2] += 3 * $potionBought[$i]; }
                    if ($i == 4) { $items_usados[2] += 2 * $potionBought[$i];
                                   $items_usados[4] += 3 * $potionBought[$i];
                                   $items_usados[5] += 3 * $potionBought[$i]; }
                    if ($i == 5) { $items_usados[3] += 2 * $potionBought[$i];
                                   $items_usados[4] += 3 * $potionBought[$i];
                                   $items_usados[5] += 3 * $potionBought[$i]; }

                    //new Potion("Best Harvest",[[0,5],[1,2]],this ,"Great fertilizer.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","agriculture"),
                    //new Potion("Happy Cow", [[0,5],[3,2]],this,"More cows!","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "ganadery"),
                    //new Potion("Ache Shooer", [[1,5],[4,2]],this,"Less pain.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "health"),
                    //new Potion("Rats Repeller", [[0,3],[1,3],[2,3]],this,"Rats away.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","higiene"),
                    //new Potion("Take Over Hangover", [[2, 2], [4, 3], [5, 3]],this,"Reduces hangover.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","other"),
                    //new Potion("Lovesickness", [[3,2],[4,3],[5,3]],this,"Anti heartbreak","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","social")
                }

                //POCIONES
                for ($i = 0; $i < count($potionBought); $i++) {

                    if ($potionBought[$i] < 0) 
                    {
                        //blacklist - Las pociones no deben disminuir en la creacion
                        $fraude = TRUE;
                        $i = count($potionBought);
                        array_push($TipoFraude, 1);
                    }
                }

                //ITEMS
                for ($i = 0; $i < count($items_usados); $i++) {

                    $item_actual = $itemsDB[$i] - $items_usados[$i];

                    //fraude si los items totales sea diferente a la JS o menor a 0
                    if ($itemsJS[$i] != $item_actual || $item_actual < 0)
                    {
                        //blacklist - Hubo manipulacion en pociones
                        $fraude = TRUE;
                        $i = count($items_usados);
                        array_push($TipoFraude, 2);
                    }
                }
            }
            else
            {
                //blacklist - Los rodos no deben variar
                $fraude = TRUE;
            }
        }

        if ($fraude === FALSE)
        {
            echo "grabando: ";
            echo $_data;
            
            $sth = $dbh->prepare('UPDATE `PotionSeller_db` SET `Data` = :datos WHERE `WalletAddress` = :usuario');
            $sth->bindParam(':datos', $_data, PDO::PARAM_STR);
            $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
            $sth->execute();
        }
        else
        {
    
            //wallet
            //tipo
            //tiempo

            //dataJS (data + compra)
            //dataDB (data + compra = dataJS

            $FraudeString = implode(',', $TipoFraude);

            $sth = $dbh->prepare('INSERT  INTO `Fraudes` (`WalletAddress`,`DataDB`,`DataJS`,`TipoFraude`,`Lugar`)
                                VALUES ('.$_usuario.',
                                        "'.$_data.'",
                                        "'.$result[0]['Data'].'",
                                        "'.$FraudeString.'",
                                        "pociones")');
            $sth->execute();
        }
    }
    
    $dbh->commit();
    echo count($result);
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>
