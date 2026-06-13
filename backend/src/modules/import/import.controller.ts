export const importHtmlZip = async (
  req,
  res
) => {

  console.log(
    "ZIP FILE",
    req.file
  );

  return res.json({
    success: true
  });
};