export const importHtmlZip = async (
  req,
  res
) => {

  console.log(
    "ZIP FILE",
    req.file
  );
console.log(
  "ZIP FILE",
  req.file
);

return res.json({
  success: true,
  file: req.file
});
};