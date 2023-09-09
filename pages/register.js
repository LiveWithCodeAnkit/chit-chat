import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
} from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { auth, storage, db } from "../firebase/firebase";
import { GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { IoLogoGoogle } from "react-icons/io";
import Link from "next/link";

import { useAuth } from "@/context/authContext";
import Loader from "@/components/Loader";
import { profileColors } from "@/utils/constants";

const gProvider = new GoogleAuthProvider();
const fProvider = new FacebookAuthProvider();

const Register = () => {
  const router = useRouter();
  const { currentUser, isLoading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoading && currentUser) {
      router.push("/");
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const colorIndex = Math.floor(Math.random() * profileColors.length);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      if (user) {
        await updateProfile(user, {
          displayName,
        });

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName,
          email,
          color: profileColors[colorIndex],
        });

        if (e.target[3]?.files?.[0]) {
          const file = e.target[3].files[0];
          const storageRef = ref(storage, displayName);
          const uploadTask = uploadBytesResumable(storageRef, file);

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              // Upload progress monitoring
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log("Upload is " + progress + "% done");
            },
            (error) => {
              console.error(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              await updateProfile(user, {
                photoURL: downloadURL,
              });

              await setDoc(doc(db, "users", user.uid), {
                photoURL: downloadURL,
              });

              await setDoc(doc(db, "userChats", user.uid), {});

              router.push("/");
            }
          );
        } else {
          await setDoc(doc(db, "userChats", user.uid), {});
          router.push("/");
        }
      }
    } catch (error) {
      console.error(error);
      setError("Registration failed. Please check your details and try again.");
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, gProvider);
    } catch (error) {
      console.error("An error occurred", error);
    }
  };

  return isLoading || (!isLoading && !!currentUser) ? (
    <Loader />
  ) : (
    <div className="h-[100vh] flex justify-center items-center bg-c1">
      <div className="flex items-center flex-col">
        <div className="text-center">
          <div className="text-4xl font-bold">Create New Account</div>
          <div className="mt-3 text-c3">
            Connect and chat with anyone, anywhere
          </div>
        </div>
        <div className="flex items-center gap-2 w-full mt-10 mb-5">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full h-14 rounded-md cursor-pointer p-[1px]"
            onClick={signInWithGoogle}
          >
            <div className="flex items-center justify-center gap-3 text-white font-semibold bg-c1 w-full h-full rounded-md">
              <IoLogoGoogle size={24} />
              <span>Login with Google</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-5 h-[1px] bg-c3"></span>
          <span className="text-c3 font-semibold">OR</span>
          <span className="w-5 h-[1px] bg-c3"></span>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-3 w-[500px] mt-5"
        >
          <input
            type="text"
            placeholder="Display Name"
            className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3"
            autoComplete="off"
            required
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3"
            autoComplete="off"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3"
            autoComplete="off"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3"
          />
          {error && <div className="text-red-500">{error}</div>}
          <button className="mt-4 w-full h-14 rounded-xl outline-none text-base font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Sign Up
          </button>
        </form>
        <div className="flex justify-center gap-1 text-c3 mt-5">
          <span>Already have an account?</span>
          <Link
            href="/login"
            className="font-semibold text-white underline underline-offset-2 cursor-pointer"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
