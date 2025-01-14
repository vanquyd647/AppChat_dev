import React, { useState, useEffect } from 'react';
import { SafeAreaView, Pressable, StyleSheet, Text, View, Image, FlatList, TouchableOpacity } from 'react-native';
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, deleteDoc, writeBatch, onSnapshot } from "firebase/firestore";

const Friend_sents = () => {

  const [userFriendsList, setUserFriendsList] = useState([]);

  useEffect(() => {
    const fetchUserFriends = async () => {
      try {
        const db = getFirestore();
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const unsubscribe = onSnapshot(userDocRef, async (userDocSnapshot) => {
            if (userDocSnapshot.exists()) {
              const userData = userDocSnapshot.data();

              const friendsCollectionRef = collection(db, "users", user.uid, "friend_Sents");
              const friendsQuery = query(friendsCollectionRef);
              const unsubscribeFriends = onSnapshot(friendsQuery, async (friendsSnapshot) => {
                const userFriends = [];
                const batch = writeBatch(db);
                for (const friendDoc of friendsSnapshot.docs) {
                  const friend_Sents = friendDoc.data();
                  const friendUID = friend_Sents.UID_fr;
                  const friendDataRef = collection(db, "users", user.uid, "friendData");
                  const friendDataQuery = query(friendDataRef, where("UID_fr", "==", friendUID));
                  const friendDataSnapshot = await getDocs(friendDataQuery);
                  if (!friendDataSnapshot.empty) {

                    batch.delete(friendDoc.ref);
                  } else {

                    userFriends.push({
                      id: friendDoc.id,
                      name: friend_Sents.name_fr,
                      photoUrl: friend_Sents.photoURL_fr,
                      userId: friend_Sents.email_fr,
                      UID: friend_Sents.UID_fr,
                      ID_roomChat: friend_Sents.ID_roomChat
                    });
                  }
                }

                await batch.commit();
                setUserFriendsList(userFriends);
              });
              return () => {
                unsubscribeFriends();
              };
            } else {
              console.error("User document does not exist!");
            }
          });
          return () => unsubscribe();
        } else {
          console.error("No user signed in!");
        }
      } catch (error) {
        console.error("Error fetching user friends:", error);
      }
    };

    fetchUserFriends();
  }, []);


  const handleCancel = async (friend) => {
    console.log('friend', friend);
    try {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const friendSentRef = doc(db, "users", user.uid, "friend_Sents", friend.id);
          await deleteDoc(friendSentRef);
          const friendReceivedCollectionRef = collection(db, "users", friend.UID, "friend_Receiveds");
          const q = query(friendReceivedCollectionRef, where("UID_fr", "==", user.uid));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (docSnapshot) => {
            await deleteDoc(docSnapshot.ref);
          });
          console.log("Friend request canceled successfully!");
        } else {
          console.error("User document does not exist!");
        }
      } else {
        console.error("No user signed in!");
      }
    } catch (error) {
      console.error("Error canceling friend request:", error);
    }
  };

  const renderUserFriendItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Pressable>
        <View style={styles.containerProfile}>
          <Image style={styles.image} source={{ uri: item.photoUrl }} />
          <Text style={styles.text}>{item.name}</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => handleCancel(item)}>
            <Text style={styles.addButtonText}>Hủy lời mời</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View>
          <FlatList
            data={userFriendsList}
            renderItem={renderUserFriendItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerProfile: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 60,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#006AF5",
    padding: 9,
    height: 48,
    width: '100%',
  },
  searchInput: {
    flex: 1,
    justifyContent: "center",
    height: 48,
    marginLeft: 10,
  },
  textSearch: {
    color: "white",
    fontWeight: '500'
  },
  itemContainer: {
    marginTop: 5,
    flex: 1,
    margin: 5,
  },
  image: {
    marginLeft: 15,
    width: 55,
    height: 55,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#006AF5',
  },
  text: {
    marginLeft: 20,
    fontSize: 20,
    flex: 1,
  },
  view1: {
    flexDirection: 'row',
    margin: 10,
  },
  text1: {
    fontSize: 15,
    justifyContent: "center",
    marginLeft: 10
  },
  addButton: {
    marginLeft: 20,
    backgroundColor: '#006AF5',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Friend_sents;
