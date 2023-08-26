// export const pinFile = async (file, onError) => {
//   const formData = new FormData();
//   formData.append("file", file);

//   const config = {
//     method: "POST",
//     maxContentLength: Infinity,
//     headers: {
//       pinata_api_key: pinataApiKey,
//       pinata_secret_api_key: pinataSecret,
//     },
//     body: formData,
//   };

//   try {
//     const response = await fetch(pinataApiEndpoint, config);

//     const data = await response.json();

//     return data.IpfsHash as string;
//   } catch (error) {
//     onError({ error });
//   }
// };
