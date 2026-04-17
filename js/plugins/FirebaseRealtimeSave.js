(() => {
    // === GUARDAR PARTIDA EN LA NUBE ===
    const alias_StorageManager_saveObject = StorageManager.saveObject;
    
    StorageManager.saveObject = function(saveName, object) {
        return alias_StorageManager_saveObject.call(this, saveName, object).then(() => {
            const user = firebase.auth().currentUser;
            if (user) {
                // CORRECCIÓN: Usar JsonEx en lugar de JSON normal
                const jsonString = JsonEx.stringify(object);
                const dbRef = firebase.database().ref('saves/' + user.uid + '/' + saveName);
                
                return dbRef.set(jsonString).then(() => {
                    console.log("Éxito: Partida guardada en la nube.");
                }).catch(err => {
                    console.warn("Fallo al subir partida a la nube:", err);
                });
            }
        });
    };

    // === CARGAR PARTIDA DESDE LA NUBE ===
    const alias_StorageManager_loadObject = StorageManager.loadObject;
    
    StorageManager.loadObject = function(saveName) {
        const user = firebase.auth().currentUser;
        
        if (user) {
            const dbRef = firebase.database().ref('saves/' + user.uid + '/' + saveName);
            
            return dbRef.once('value').then(snapshot => {
                if (snapshot.exists()) {
                    console.log("Éxito: Partida cargada desde la nube.");
                    // CORRECCIÓN: Usar JsonEx en lugar de JSON normal
                    return JsonEx.parse(snapshot.val());
                } else {
                    return alias_StorageManager_loadObject.call(this, saveName);
                }
            }).catch(err => {
                return alias_StorageManager_loadObject.call(this, saveName);
            });
        } else {
            return alias_StorageManager_loadObject.call(this, saveName);
        }
    };
})();