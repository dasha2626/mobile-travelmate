export const uploadAvatar = async (uri: string, userId: string) => {

  const formData = new FormData();

  formData.append("avatar", {
    uri,
    type: "image/jpeg",
    name: "avatar.jpg"
  } as any);

  try {
  const res = await fetch(
    `${process.env.EXPO_PUBLIC_API_URL}/api/avatar/${userId}`,
    {
      method: "POST",
      body: formData
    }
  );

    if (!res.ok) {
      throw new Error("Upload avatar failed");
    }

    return await res.json();

  } catch (error) {
    console.log("Avatar upload error:", error);
    throw error;
  }
};



/* ⭐ Pobieranie avatara */
export const getAvatar = async (userId: string) => {

  try {

  const res = await fetch(
  `${process.env.EXPO_PUBLIC_API_URL}/api/avatar/${userId}`
);
    if (!res.ok) return null;

    return await res.json();

  } catch (error) {
    console.log("Get avatar error:", error);
    return null;
  }
};