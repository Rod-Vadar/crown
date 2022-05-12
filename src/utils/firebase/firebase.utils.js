import { initializeApp } from "firebase/app";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    signInWithRedirect,
    signInWithPopup,
    GoogleAuthProvider,
    createUserWithEmailAndPassword
} from 'firebase/auth'

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection,
    writeBatch,
    query,
    getDocs,
    } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MEESAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

const googleprovider = new GoogleAuthProvider();

googleprovider.setCustomParameters({
    prompt: 'select_account'
});

export const auth = getAuth(app);
export const signInWithGooglePopup = ()=> signInWithPopup(auth,googleprovider)
export const signInWithGoogleRedirect =()=> signInWithRedirect(auth,googleprovider)

export const db = getFirestore()

export const addCollectionAndDocuments = async (collectionKey, objectsToAdd)=>{
    const collectionRef = collection(db, collectionKey)
    const batch = writeBatch(db)

    objectsToAdd.forEach((object)=>{
        const docRef = doc(collectionRef, object.title.toLowerCase())
        batch.set(docRef, object)
    })
    await batch.commit()
    console.log('batch is done')
}

export const getCategoriesAndDocuments = async ()=>{
    const collectionRef = collection(db, 'categories')
    const q = query(collectionRef)

    const querySnapshot = await getDocs(q)
    const categoryMap = querySnapshot.docs.reduce((acc, docSnapshot)=>{
        const {title, items} = docSnapshot.data()
        acc[title.toLowerCase()] = items
        return acc
    },{})

    return categoryMap
}

export const createUserDocumentFromAuth = async (userAuth, additionalInformation={})=>{
    if(!userAuth){
        return
    }
    const userDocRef = doc(db, 'users', userAuth.uid )

    const userSnapShot = await getDoc(userDocRef);

    if(!userSnapShot.exists()){
        const {displayName, email} = userAuth
        const createdAt = new Date()

        try{
            await setDoc(userDocRef,{
                displayName,
                email,
                createdAt,
                ...additionalInformation
            })
        }catch(error){
            console.log('error creating the user', error.message)
        }
    }
    return userDocRef
};

export const createAuthUserWithEmailAndPassword = async(email, password)=>{
    if(!email || !password){
        return
    }
    return await createUserWithEmailAndPassword(auth, email, password)
}

export const signInAuthUserWithEmailAndPassword = async(email, password)=>{
    if(!email || !password){
        return
    }
    return await signInWithEmailAndPassword(auth, email, password)
}

export const signOutUser =async()=>{await signOut(auth)}

export const onAuthStateChangedListener =(callback)=>
onAuthStateChanged(auth, callback)