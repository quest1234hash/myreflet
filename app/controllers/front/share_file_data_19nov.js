var { UserModel, LogDetailsModel } = require("../../models/user");
var {
  SecurityMasterModel,
  UserSecurityModel,
} = require("../../models/securityMaster");
var { WalletModel, WalletModelImport } = require("../../models/wallets");
var {
  MyReflectIdModel,
  DocumentReflectIdModel,
  FilesDocModel,
} = require("../../models/reflect");
var {
  CountryModel,
  VerifierCategoryMasterModel,
  DocumentMasterModel,
} = require("../../models/master");
var {
  ClientVerificationModel,
  RequestDocumentsModel,
  RequestFilesModel,
} = require("../../models/request");
var { ComplaintModel, CommentModel } = require("../../models/complaint");
var { NotificationModel } = require("../../models/notification");
var { DigitalWalletRelsModel } = require("../../models/wallet_digital_rels");
var { childWalletModel } = require("../../models/childe_wallet");
var url = require("url");
var http = require("http");
var sizeOf = require("buffer-image-size");
const nodemailer = require("nodemailer");
var db = require("../../services/database");
var sequelize = require("sequelize");
var bitcoin = require("bitcoinjs-lib");

const ejs = require("ejs");
var pdf = require("html-pdf");

const Op = sequelize.Op;
var dataUriToBuffer = require("data-uri-to-buffer");

var { decrypt, encrypt } = require("../../helpers/encrypt-decrypt");

var dateTime = require("node-datetime");
var crypto = require("crypto");
var text_func = require("../../helpers/text");
var mail_func = require("../../helpers/mail");
const util = require("util");
const { base64encode, base64decode } = require("nodejs-base64");
const generateUniqueId = require("generate-unique-id");
var moment = require("moment");
const formidable = require("formidable");
var Jimp = require("jimp");
var toBuffer = require("blob-to-buffer");
const request = require("request");
const fetch = require("node-fetch");

const AdmZip = require('adm-zip');

var admin_notification = require("../../helpers/admin_notification.js");
const path = require("path");

const ipfsAPI = require("ipfs-api");
const fs = require("fs");
var async = require("async");
const { PDFDocument } = require("pdf-lib");

const Tx = require("ethereumjs-tx");
const Web3 = require("web3");

var web3 = new Web3(
  new Web3.providers.HttpProvider("http://13.233.173.250:8501")
);

const InputDataDecoder = require("ethereum-input-data-decoder");
const { Console } = require("console");
const { json } = require("sequelize");

const ipfs = ipfsAPI("ipfs.infura.io", "5001", { protocol: "https" });

var contractABI = [
  {
    constant: true,
    inputs: [{ name: "", type: "uint256" }],
    name: "documents",
    outputs: [{ name: "doc", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "doc", type: "string" },
      { name: "verifier_email", type: "string" },
      { name: "client_email", type: "string" },
      { name: "doc_name", type: "string" },
      { name: "verifier_myReflect_code", type: "string" },
      { name: "client_myReflect_code", type: "string" },
      { name: "request_status", type: "string" },
      { name: "reason", type: "string" },
    ],
    name: "addDocument",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "getDocumentsCount",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "index", type: "uint256" }],
    name: "getDocument",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

const decoder = new InputDataDecoder(contractABI);

const {
  MAIL_SEND_ID,
  PASS_OF_MAIL,
  TOKEN_SECRET,
} = require("../../config/config");
/**Get share_rep_document List For Individual request Method Start  **/
exports.share_rep_document = async (req, res, next) => {
  var reflect_id = req.body.reflect_id;
  var expire_date = req.body.expire_date;
  var doc_unique_code = req.body.doc_unique_code;
  var doc_create_date = req.body.doc_create_date;
  var reflect_id = req.body.reflect_id;
  var label = req.body.document_name;
  var user_doc_id = req.body.user_doc_id;
  var user_email = req.body.user_email;
  var reflect_code = req.body.reflect_code;
  var name = req.body.share_name;

  await db
    .query(
      "SELECT * FROM `tbl_files_docs` inner join tbl_myreflectid_doc_rels on tbl_myreflectid_doc_rels.user_doc_id=tbl_files_docs.user_doc_id where tbl_files_docs.user_doc_id=" +
        user_doc_id +
        " and reflect_id=" +
        reflect_id,
      { type: db.QueryTypes.SELECT }
    )
    .then(function (data) {
      console.log(data[0].file_content);
      var document_name = data[0].document_name;

      ejs.renderFile(
        "app/views/front/myReflect/share-byMail.ejs",
        { data, moment, doc_unique_code, moment, expire_date },
        async (err, data) => {
          // console.log("don1 "+data)

          if (err) {
            console.log("EEEEEEEEEERRRRRRRRR       1" + err);
          } else {
            let options = {
              height: "11.25in",
              width: "8.5in",
              header: {
                height: "20mm",
              },
              footer: {
                height: "20mm",
              },
            };
            console.log("EEEEEEEEEERRRRRRRRR out      ");

            // async function upload_file(){

            pdf
              .create(data, options)
              .toFile(
                "app/uploads/document_pdf/" +
                  label +
                  "_" +
                  doc_unique_code +
                  ".pdf",
                async function (err, data) {
                  // console.log("don441 "+data)
                  // console.log("EEEEEEEEEERRRRRRRRR    in   ",content.report_name,'report_filter_id ',content.report_filter_id)

                  if (err) {
                    console.log("pdf create data       2" + err);
                  } else {
                    // data='update';
                    console.log(
                      "pdf create data    label    2" + label,
                      " email   : ",
                      user_email
                    );

                    var smtpTransport = nodemailer.createTransport({
                      service: "gmail",
                      auth: {
                        user: MAIL_SEND_ID,
                        pass: PASS_OF_MAIL,
                      },
                    });
                    const mailOptions = {
                      to: user_email,
                      from: "questtestmail@gmail.com",
                      subject: "Shared Details Of MyReflet Document.",
                      attachments: [
                        {
                          filename: `${label}_${doc_unique_code}.pdf`,
                          path: `app/uploads/document_pdf/${label}_${doc_unique_code}.pdf`,
                          contentType: "application/pdf",
                        },
                      ],
                    };
                    smtpTransport.sendMail(mailOptions, function (err) {
                      console.log("done");

                      const path = `app/uploads/document_pdf/${label}_${doc_unique_code}.pdf`;

                      try {
                        fs.unlinkSync(path);
                        res.redirect("/view-reflect-id?id=" + reflect_code);

                        //file removed
                      } catch (err) {
                        console.error(err);
                      }
                    });

                    console.log("File created successfully");
                  }
                }
              );
          }
        }
      );
    });
};
/**Get share_rep_documentFor Individual request Method End  **/

/**Get share_rep_document List For Individual request Method Start  **/
exports.share_entity_document = async (req, res, next) => {
  var reflect_id = req.body.reflect_id;
  var expire_date = req.body.expire_date;
  var doc_unique_code = req.body.doc_unique_code;
  var doc_create_date = req.body.doc_create_date;
  var reflect_id = req.body.reflect_id;
  var label = req.body.document_name;
  var user_doc_id = req.body.user_doc_id;
  var user_email = req.body.user_email;
  var reflect_code = req.body.reflect_code;
  var name = req.body.share_name;

  await db
    .query(
      "SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date  FROM `tbl_files_docs` inner join tbl_myreflectid_doc_rels on tbl_myreflectid_doc_rels.user_doc_id=tbl_files_docs.user_doc_id INNER join tbl_documents_masters on tbl_documents_masters.doc_id=tbl_myreflectid_doc_rels.doc_id where tbl_files_docs.user_doc_id=" +
        user_doc_id +
        " and reflect_id=" +
        reflect_id,
      { type: db.QueryTypes.SELECT }
    )
    .then(function (data) {
      var document_name = data[0].document_name;

      ejs.renderFile(
        "app/views/front/myReflect/share-byMail.ejs",
        { data, moment, doc_unique_code, moment, expire_date },
        async (err, data) => {
          // console.log("don1 "+data)

          if (err) {
            console.log("EEEEEEEEEERRRRRRRRR       1" + err);
          } else {
            let options = {
              height: "11.25in",
              width: "8.5in",
              header: {
                height: "20mm",
              },
              footer: {
                height: "20mm",
              },
            };
            console.log("EEEEEEEEEERRRRRRRRR out      ");

            // async function upload_file(){

            pdf
              .create(data, options)
              .toFile(
                "app/uploads/document_pdf/" +
                  document_name +
                  "_" +
                  doc_unique_code +
                  ".pdf",
                async function (err, data) {
                  // console.log("don441 "+data)
                  // console.log("EEEEEEEEEERRRRRRRRR    in   ",content.report_name,'report_filter_id ',content.report_filter_id)

                  if (err) {
                    console.log("pdf create data       2" + err);
                  } else {
                    // data='update';
                    console.log(
                      "pdf create data    document_name    2" + document_name,
                      " email   : ",
                      user_email
                    );

                    var smtpTransport = nodemailer.createTransport({
                      service: "gmail",
                      auth: {
                        user: MAIL_SEND_ID,
                        pass: PASS_OF_MAIL,
                      },
                    });
                    const mailOptions = {
                      to: user_email,
                      from: "questtestmail@gmail.com",
                      subject: "Shared Details Of MyReflet Document.",
                      attachments: [
                        {
                          filename: `${document_name}_${doc_unique_code}.pdf`,
                          path: `app/uploads/document_pdf/${document_name}_${doc_unique_code}.pdf`,
                          contentType: "application/pdf",
                        },
                      ],
                    };
                    smtpTransport.sendMail(mailOptions, function (err) {
                      console.log("done");

                      const path = `app/uploads/document_pdf/${document_name}_${doc_unique_code}.pdf`;

                      try {
                        fs.unlinkSync(path);
                        res.redirect(`/entity?reflect_id=${reflect_id}`);

                        //file removed
                      } catch (err) {
                        console.error(err);
                      }
                    });

                    console.log("File created successfully");
                  }
                }
              );
          }
        }
      );
    });
};
/**Get share_rep_documentFor Individual request Method End  **/

/**Get share_rep_document List For Individual request Method Start  **/
exports.share_verifier_document = async (req, res, next) => {
  var reflect_id = req.body.reflect_id;
  var expire_date = req.body.expire_date;
  var doc_unique_code = req.body.doc_unique_code;
  var doc_create_date = req.body.doc_create_date;
  var reflect_id = req.body.reflect_id;
  var label = req.body.document_name;
  var user_doc_id = req.body.user_doc_id;
  var user_email = req.body.user_email;
  var reflect_code = req.body.reflect_code;
  var name = req.body.share_name;

  await db
    .query(
      "SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM `tbl_files_docs` inner join tbl_myreflectid_doc_rels on tbl_myreflectid_doc_rels.user_doc_id=tbl_files_docs.user_doc_id INNER join tbl_documents_masters on tbl_documents_masters.doc_id=tbl_myreflectid_doc_rels.doc_id where tbl_files_docs.user_doc_id=" +
        user_doc_id +
        " and reflect_id=" +
        reflect_id,
      { type: db.QueryTypes.SELECT }
    )
    .then(function (data) {
      // console.log("GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG")
      //       console.log(data)
      // console.log("GGGGGGGGGGGGGGGGGGGGGGGGG sdf GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG",data)

      var document_name = data[0].document_name;

      ejs.renderFile(
        "app/views/front/myReflect/share-byMail.ejs",
        { data, moment, doc_unique_code, moment, expire_date },
        async (err, data) => {
          // console.log("don1 "+data)

          if (err) {
            console.log("EEEEEEEEEERRRRRRRRR       1" + err);
          } else {
            let options = {
              height: "11.25in",
              width: "8.5in",
              header: {
                height: "20mm",
              },
              footer: {
                height: "20mm",
              },
            };
            console.log("EEEEEEEEEERRRRRRRRR out      ");

            // async function upload_file(){

            pdf
              .create(data, options)
              .toFile(
                "app/uploads/document_pdf/" +
                  document_name +
                  "_" +
                  doc_unique_code +
                  ".pdf",
                async function (err, data) {
                  // console.log("don441 "+data)
                  // console.log("EEEEEEEEEERRRRRRRRR    in   ",content.report_name,'report_filter_id ',content.report_filter_id)

                  if (err) {
                    console.log("pdf create data       2" + err);
                  } else {
                    console.log("File created successfully");

                    // data='update';
                    console.log(
                      "pdf create data    document_name    2" + document_name,
                      " email   : ",
                      user_email
                    );

                    var smtpTransport = nodemailer.createTransport({
                      service: "gmail",
                      auth: {
                        user: MAIL_SEND_ID,
                        pass: PASS_OF_MAIL,
                      },
                    });
                    const mailOptions = {
                      to: user_email,
                      from: "questtestmail@gmail.com",
                      subject: "Shared Details Of MyReflet Document.",
                      attachments: [
                        {
                          filename: `${document_name}_${doc_unique_code}.pdf`,
                          path: `app/uploads/document_pdf/${document_name}_${doc_unique_code}.pdf`,
                          contentType: "application/pdf",
                        },
                      ],
                    };
                    smtpTransport.sendMail(mailOptions, function (err) {
                      console.log("done");

                      const path = `app/uploads/document_pdf/${document_name}_${doc_unique_code}.pdf`;

                      try {
                        fs.unlinkSync(path);
                        res.redirect(
                          "/myreflect-verifier-view?id=" + reflect_code
                        );
                        console.log("File deleted successfully");

                        //file removed
                      } catch (err) {
                        console.error(err);
                      }
                    });
                  }
                }
              );
          }
        }
      );
    });
};
/**Get share_rep_documentFor Individual request Method End  **/

/**Get share_rep_document List For Individual request Method Start  **/
exports.export_individual_document = async (req, res, next) => {
  var reflect_id = req.body.reflect_id;
  var expire_date = req.body.expire_date;
  var doc_unique_code = req.body.doc_unique_code;
  var doc_create_date = req.body.doc_create_date;
  var reflect_id = req.body.reflect_id;
  var document_name = req.body.document_name;
  var user_doc_id = req.body.user_doc_id;
  var user_email = req.body.user_email;
  var reflect_code = req.body.reflect_code;
  var name = req.body.share_name;
  var i = 1;

  var certify = req.body.certify;
  console.log("UUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUU : ", certify);

  if (certify == "0") {
    await db
      .query(
        "SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM `tbl_files_docs` inner join tbl_myreflectid_doc_rels on tbl_myreflectid_doc_rels.user_doc_id=tbl_files_docs.user_doc_id INNER join tbl_documents_masters on tbl_documents_masters.doc_id=tbl_myreflectid_doc_rels.doc_id where tbl_files_docs.user_doc_id=" +
          user_doc_id +
          " and reflect_id=" +
          reflect_id +
          " and type <> 'video'",
        { type: db.QueryTypes.SELECT }
      )
      .then(async function (download_data) {
        document_name = download_data[0].document_name;
        doc_unique_code = download_data[0].doc_unique_code;

        var type_val = 0;
        type_val = await countTypes(download_data);
        console.log("out counttype call---", type_val);

        console.log("download data", download_data);
        console.log(
          "GGGGGGGGGGGGGGGGGGGGGGGGG sdf GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
        );

        async.each(download_data, async function (content, cb) {

          console.log("in loop async call---", i);

          var image = "no";

          //  res.render('front/my-reflet-id-verifier/download-verifier',{download_data,moment,certify})
          if (content.type == "image" && image === "no") {
            ejs.renderFile(
              "app/views/front/myReflect/download_file.ejs",
              {
                download_data,
                doc_unique_code,
                doc_create_date,
                expire_date,
                moment,
                certify,
              },
              async (err, data) => {
                // console.log("don1 "+data)

                if (err) {
                  console.log("EEEEEEEEEERRRRRRRRR       1" + err);
                } else {
                  let options = {
                    height: "11.25in",
                    width: "8.5in",
                    header: {
                      height: "20mm",
                    },
                    footer: {
                      height: "20mm",
                    },
                  };
                  console.log("EEEEEEEEEERRRRRRRRR out      ");

                  // async function upload_file(){

                  pdf
                    .create(data, options)
                    .toFile(
                      "app/uploads/document_pdf/" +
                        document_name +
                        "_" +
                        doc_unique_code +
                        "_" +
                        i +
                        ".pdf",
                      async function (err, data) {
                        // console.log("don441 "+data)
                        // console.log("EEEEEEEEEERRRRRRRRR    in   ",content.report_name,'report_filter_id ',content.report_filter_id)

                        if (err) {
                          console.log("pdf create data       2" + err);
                        } else {
                          console.log("File created successfully");

                          // data='update';
                          console.log(
                            "pdf create data    document_name    2" +
                              document_name,
                            " email   : "
                          );

                          const path = `app/uploads/document_pdf/${document_name}_${doc_unique_code}_${i}.pdf`;

                          fs.readFile(
                            `app/uploads/document_pdf/${document_name}_${doc_unique_code}_${i}.pdf`,
                            async (err, data) => {
                              image = "yes";
                              console.log("!!!!! ", i);
                              if (i === type_val) {
                               await finalCall(type_val);
                              }
                              i++;
                            }
                          );
                        }
                      }
                    );
                }
              }
            );
          } else if (content.type == "pdf") {
            console.log("in else pdf---");
            const run = async (OldHash) => {
              let promise = new Promise(async (resolve, reject) => {
                console.log("hello 0");

                const url = `https://ipfs.io/ipfs/${OldHash}`;

                const pdf1 = await fetch(url).then((res) => res.arrayBuffer());
                console.log("pdf1 : ", pdf1);
                resolve(pdf1);
              });

              await promise.then(async (pdf1) => {

        
                const pdfDoc = await PDFDocument.load(pdf1);

                const pdfBytes = await pdfDoc.save();

                fs.writeFileSync('./app/uploads/document_pdf/'+document_name+'_'+doc_unique_code+'_'+i+'.pdf', pdfBytes)

                console.log("*****!!!!! ", i);
                if (i === type_val) {
                  await finalCall(type_val);
                }
                i++;
              });
            };
            await run(content.file_content);
          }
        });
      });
    async function countTypes(download_data) {
      console.log("1 in counttype call---", type_val);
      var type_val = 0;
      var image_count = 0;
      var pdf_count = 0;
      for (obj of download_data) {
        if (obj.type == "image") {
          image_count++;
        } else if (obj.type == "pdf") {
          pdf_count++;
        }
      }
      if (image_count > 0 && pdf_count > 0) {
        type_val = 2;
      } else if (image_count == 0 && pdf_count == 0) {
        type_val = 0;
      } else {
        type_val = 1;
      }
      console.log("2 in counttype call---", type_val);
      return type_val;
    }

    async function finalCall(type_val) {

      console.log("in final call---");
      const zip = new AdmZip();

      for (var i = 1; i <= type_val ; i++) {
        zip.addLocalFile(`./app/uploads/document_pdf/${document_name}_${doc_unique_code}_${i}.pdf`);
      }

      // Define zip file name
      const downloadName = `${document_name}_${doc_unique_code}.zip`;

      const data = zip.toBuffer();
      console.log("dataaaa",data)
      // save file zip in root directory
      console.log("----------",__dirname+"/"+downloadName)
      zip.writeZip(__dirname+"/"+downloadName);

      // code to download zip file

      res.set("Content-Type", "application/octet-stream");
      res.set("Content-Disposition", `attachment; filename=${downloadName}`);
      res.set("Content-Length", data.length);
      res.send(data);
      //if (err) res.status(500).send(err);
      // res
      //   .contentType("application/pdf")
      //   .send(
      //     `data:application/pdf;base64,${new Buffer.from(
      //       data
      //     ).toString("base64")}`
      //   );

      // try {
      //   // res.send(`app/uploads/document_pdf/${document_name}_${doc_unique_code}.pdf`)
      //   //  res.redirect('/myreflect-verifier-view?id='+reflect_code);
      //   console.log("File deleted successfully");
      //   fs.unlinkSync(path);

      //   //file removed
      // } catch (err) {
      //   console.error(err);
      // }
    }
  } else {
    db.query(
      "SELECT *,tbl_myreflectid_doc_rels.createdAt as doc_create_date FROM `tbl_files_docs` inner join tbl_myreflectid_doc_rels on tbl_myreflectid_doc_rels.user_doc_id=tbl_files_docs.user_doc_id INNER join tbl_documents_masters on tbl_documents_masters.doc_id=tbl_myreflectid_doc_rels.doc_id where tbl_files_docs.user_doc_id=" +
        user_doc_id +
        " and reflect_id=" +
        reflect_id +
        " and type='image'",
      { type: db.QueryTypes.SELECT }
    ).then(function (download_data) {
      console.log(
        "EEEEEEEEEEEEEEEEEEEEEEEELLLLLLLLLLLLLLLLLLSSSSSSSSSSSSSSSSSSSSS"
      );
      // console.log(download_data)
      console.log(
        "GGGGGGGGGGGGGGGGGGGGGGGGG sdf GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG"
      );

      var ipfsData = [];
      var i = 0;

      async.each(
        download_data,
        async function (content, cb) {
          await request(
            `https://ipfs.io/ipfs/${content.self_attested_hash}`,
            function (error, response, body) {
              // console.log('ipfsData : ',content.self_attested_hash)

              if (!error && response.statusCode == 200) {
                var srcImage = dataUriToBuffer(body);

                ipfsData.push(body);

                console.log("i length : ", ipfsData.length);
                console.log("i ejs length : ", download_data[0].req_ipfs_data);

                console.log("i length : ", i, download_data.length);

                if (i == download_data.length - 1) {
                  download_data[0].req_ipfs_data = ipfsData;
                  //  res.render('front/my-reflet-id-verifier/download-verifier',{download_data,certify})

                  ejs.renderFile(
                    "app/views/front/myReflect/download_file.ejs",
                    {
                      download_data,
                      doc_unique_code,
                      doc_create_date,
                      expire_date,
                      moment,
                      certify,
                    },
                    async (err, data) => {
                      // console.log("don1 "+data)

                      if (err) {
                        console.log("EEEEEEEEEERRRRRRRRR       1" + err);
                      } else {
                        let options = {
                          height: "11.25in",
                          width: "8.5in",
                          header: {
                            height: "20mm",
                          },
                          footer: {
                            height: "20mm",
                          },
                        };
                        console.log("EEEEEEEEEERRRRRRRRR out      ");

                        // async function upload_file(){

                        pdf
                          .create(data, options)
                          .toFile(
                            "app/uploads/document_pdf/" +
                              document_name +
                              "_" +
                              doc_unique_code +
                              ".pdf",
                            async function (err, data) {
                              // console.log("don441 "+data)
                              // console.log("EEEEEEEEEERRRRRRRRR    in   ",content.report_name,'report_filter_id ',content.report_filter_id)

                              if (err) {
                                console.log("pdf create data       2" + err);
                              } else {
                                console.log("File created successfully");

                                // data='update';
                                console.log(
                                  "pdf create data    document_name    2" +
                                    document_name,
                                  " email   : ",
                                  user_email
                                );

                                const path = `app/uploads/document_pdf/${document_name}_${doc_unique_code}.pdf`;

                                fs.readFile(
                                  `app/uploads/document_pdf/${document_name}_${doc_unique_code}.pdf`,
                                  (err, data) => {
                                    if (err) res.status(500).send(err);
                                    res
                                      .contentType("application/pdf")
                                      .send(
                                        `data:application/pdf;base64,${new Buffer.from(
                                          data
                                        ).toString("base64")}`
                                      );

                                    try {
                                      // res.send(`app/uploads/document_pdf/${document_name}_${doc_unique_code}.pdf`)
                                      //  res.redirect('/myreflect-verifier-view?id='+reflect_code);
                                      console.log("File deleted successfully");
                                      fs.unlinkSync(path);

                                      //file removed
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }
                                );
                              }
                            }
                          );
                      }
                    }
                  );
                  // res.json({download_data,certify})
                }

                i++;
              } else {
                res.send(error);
              }
            }
          );
        },
        function (err) {
          if (err) {
            console.log("err", err);
          }
        }
      );
    });
  }
};
/**Get share_rep_documentFor Individual request Method End  **/

/** download certified pdf from blockchain **/
exports.search_transactions_for_download = async (req, res, next) => {
  var query = req.body.tx_value;
  var type = req.body.type;
  var doc_name = req.body.doc_name;

  var user_reg_id = req.session.user_id;
  console.log("value **** 123 ***** ", query);
  var page = req.query.page || 1;
  var perPage = 10;
  var page_data = [];
  var hash_data = [];
  var temp = 0;
  var doc_array = [];

  await db
    .query(
      "SELECT * FROM tbl_request_documents_files INNER JOIN tbl_request_documents ON tbl_request_documents_files.request_doc_id=tbl_request_documents.request_doc_id INNER JOIN tbl_client_verification_requests ON tbl_request_documents.request_id=tbl_client_verification_requests.request_id WHERE tbl_request_documents_files.transaction_hash LIKE '%" +
        query +
        "%' AND tbl_client_verification_requests.client_id=" +
        user_reg_id +
        " LIMIT 1",
      { type: db.QueryTypes.SELECT }
    )
    .then(async (hash_data_old) => {
      const delay = (duration) =>
        new Promise((resolve) => setTimeout(resolve, duration));

      var hash = hash_data_old[0].transaction_hash;
      var created_at = hash_data_old[0].createdAt;

      await waitForReceipt_sec(hash);

      async function waitForReceipt_sec(hashes) {
        await web3.eth.getTransaction(hashes, async function (err, body) {
          if (err) {
            error(err);
          }

          if (body !== null) {
            const result_input = decoder.decodeData(`${body.input}`);
            console.log("result result_input api ", result_input);

            if (result_input.inputs.length > 0) {
              console.log(
                "result result_input.inputs[0] api ",
                result_input.inputs[0]
              );

              var new_hash = [];

              new_hash = result_input.inputs[0].split(",");

              var t_length = new_hash.length;
              var t = 0;

              async function wait_ipfs_request() {
                async.each(new_hash, async function (content, cb) {
                  let temp = content.split("-");
                  let doc = temp[1];
                  let doc_type;

                  if (temp[0] == "image") {
                    doc_type = "image";
                    await request(
                      `https://ipfs.io/ipfs/${doc}`,
                      async function (error, response, body) {
                        console.log(
                          "result_input inner",
                          t,
                          " new_hash[t] :",
                          content
                        );

                        if (!error && response.statusCode == 200) {
                          console.log(" tttt : ", t);
                          doc_array.push({ type: doc_type, body, doc_name });

                          t++;
                        }
                      }
                    );
                  } else if (temp[0] == "pdf") {
                    doc_type = "pdf";

                    console.log(" tttt : ", t);
                    doc_array.push({ type: doc_type, body: doc, doc_name });
                    t++;
                  } else if (temp[0] == "video") {
                    doc_type = "video";

                    console.log(" tttt : ", t);
                    doc_array.push({ type: doc_type, body: doc, doc_name });
                    t++;
                  } else {
                    doc_type = "image";
                    await request(
                      `https://ipfs.io/ipfs/${doc}`,
                      async function (error, response, body) {
                        console.log(
                          "result_input inner",
                          t,
                          " new_hash[t] :",
                          content
                        );

                        if (!error && response.statusCode == 200) {
                          console.log(" tttt : ", t);
                          doc_array.push({ type: doc_type, body, doc_name });

                          t++;
                        }
                      }
                    );
                  }

                  await delay(10000);
                });
              }

              async function send_data() {
                console.log("doc length ", doc_array.length);
                console.log("receipt_array 2");

                if (type == "entity") {
                  console.log("type : ", type);

                  res.render("front/myReflect/entity_download_certified_ajax", {
                    doc_array,
                  });
                } else {
                  console.log("type : ", type);

                  res.render("front/myReflect/download_certified_ajax", {
                    doc_array,
                  });
                }

                //  res.send(doc)
              }
              console.log("before request ");

              await wait_ipfs_request();

              console.log("After request ");
              await delay(10000);

              console.log("before send ");
              await send_data();
              console.log("After send ");
            }
          } else {
            console.log("error");
          }
        });
      }
    });
};
/**  download certified pdf from blockchain **/

/** **/
exports.download_certified_pdf = async (req, res, next) => {
  var data_uri = req.body.data_uri;
  var doc_name = req.body.doc_name;

  //  res.render('front/my-reflet-id-verifier/download-verifier',{download_data,moment,certify})

  ejs.renderFile(
    "app/views/front/myReflect/download_certified_pdf_file.ejs",
    { data_uri, doc_name, moment },
    async (err, data) => {
      // console.log("don1 "+data)

      if (err) {
        console.log("EEEEEEEEEERRRRRRRRR       1" + err);
      } else {
        let options = {
          height: "11.25in",
          width: "8.5in",
          header: {
            height: "20mm",
          },
          footer: {
            height: "20mm",
          },
        };
        console.log("EEEEEEEEEERRRRRRRRR out      ");

        // async function upload_file(){
        var date_now = Date.now();
        console.log(" doc_name ", doc_name, "   date_now : : : ", date_now);
        pdf
          .create(data, options)
          .toFile(
            "app/uploads/document_pdf/" + doc_name + "_" + date_now + ".pdf",
            async function (err, data) {
              // console.log("don441 "+data)
              // console.log("EEEEEEEEEERRRRRRRRR    in   ",content.report_name,'report_filter_id ',content.report_filter_id)

              if (err) {
                console.log("pdf create data       2" + err);
              } else {
                console.log("File created successfully");

                // data='update';

                const path = `app/uploads/document_pdf/${doc_name}_${date_now}.pdf`;

                fs.readFile(
                  `app/uploads/document_pdf/${doc_name}_${date_now}.pdf`,
                  (err, data) => {
                    if (err) res.status(500).send(err);
                    res
                      .contentType("application/pdf")
                      .send(
                        `data:application/pdf;base64,${new Buffer.from(
                          data
                        ).toString("base64")}`
                      );

                    try {
                      // res.send(`app/uploads/document_pdf/${document_name}_${doc_unique_code}.pdf`)
                      //  res.redirect('/myreflect-verifier-view?id='+reflect_code);
                      console.log("File deleted successfully");
                      // fs.unlinkSync(path)

                      //file removed
                    } catch (err) {
                      console.error(err);
                    }
                  }
                );
              }
            }
          );
      }
    }
  );
};
/** **/
