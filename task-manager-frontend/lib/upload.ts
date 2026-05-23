export const uploadFiles = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });
  const response = await fetch("http://localhost:8000/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error uploading files");
  }

  const data = await response.json();
  return data.urls;
};
