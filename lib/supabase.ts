// import { createServerClient } from "@supabase/ssr";
// import { cookies } from "next/headers";
//
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
//
// export async function createSupabaseServerClient() {
//   if (!supabaseUrl || !supabaseAnonKey) {
//     throw new Error(
//       "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
//     );
//   }
//
//   const cookieStore = await cookies();
//
//   return createServerClient(supabaseUrl, supabaseAnonKey, {
//     cookies: {
//       getAll() {
//         return cookieStore.getAll();
//       },
//       setAll(cookiesToSet) {
//         try {
//           cookiesToSet.forEach(({ name, value, options }) => {
//             cookieStore.set(name, value, options);
//           });
//         } catch {
//           // Server Components cannot write cookies. Proxy and Server Actions can.
//         }
//       },
//     },
//   });
// }



import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set({
              name,
              value,
              ...options,
            });
          },
          remove(name, options) {
            cookieStore.set({
              name,
              value: "",
              ...options,
            });
          },
        },
      }
  );
}