// import { connectMongoDB } from "@/lib/mongodb";
// import User from "@/models/user";
// import NextAuth from "next-auth/next";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from 'next-auth/providers/google';

// import bcrypt from "bcryptjs";

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {},

//       async authorize(credentials) {
//         const { email, password } = credentials;

//         try {
//           await connectMongoDB();
//           const user = await User.findOne({ email });

//           if (!user) {
//             return null;
//           }

//           const passwordsMatch = await bcrypt.compare(password, user.password);

//           if (!passwordsMatch) {
//             return null;
//           }

//           return user;
//         } catch (error) {
//           console.log("Error: ", error);
//         }
//       },
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
  
//   ],

//   session: {
//     strategy: "jwt",
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: "/",
//   },
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };



import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},
   
      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ email });

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          return user;
        } catch (error) {
          console.log("Error: ", error);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        if (!profile.id && profile.email) {
          profile.id = profile.email; // Use the email as a unique identifier
        }

        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks:{
    async session({session}){

      const user=session.user;
      try {
        // Store user information in MongoDB
        await connectMongoDB();
        
        // Check if the user already exists in the database
        const existingUser = await User.findOne({ email: user.email });
  
        if (!existingUser) {
          // If the user doesn't exist, create a new user record in MongoDB
          const newUser = new User({
            email: user.email,
            name: user.name, 
           // You can customize this based on your data model
            // Add other fields as needed
          });
  
          await newUser.save();
        }
      } catch (error) {
        console.error("Error saving user to MongoDB:", error);
      }
  
  


      return session;
    }
  }
,
  session: {
    strategy: "jwt",
   
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/", // Customize the sign-in page URL if needed
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
