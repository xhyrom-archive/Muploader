import type { NextPage } from 'next';
import Head from 'next/head';
import { strToBool } from '../../utils/stringToBool';
import Highlight from 'react-highlight';
import '../../node_modules/highlight.js/styles/github.css';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Button } from 'react-bulma-components';

export const getStaticProps = () => {
    if (!strToBool(process.env.NEXT_PUBLIC_SHAREX_SUPPORT)) {
        return {
            redirect: {
              destination: "/",
            },
        }
    }

    return { props: {} };
}

const ShareX: NextPage = () => {
    const [object, setObject] = useState({});

    const downloadFile = () => {
        window.location.replace(`${window.location.origin}/api/generator/sharex?config=${JSON.stringify(object)}&token=${object['Headers']?.['Authorization']}`);
    }

    useEffect(() => {
        const set = async() => {
            const obj = {
                "Version": "13.6.1",
                "Name": "Muploader",
                "DestinationType": "ImageUploader, TextUploader, FileUploader",
                "RequestMethod": "POST",
                "RequestURL": `${window.location.origin}/api/uploadFile`,
                "Body": "MultipartFormData",
                "Arguments": {
                  "gcaptcha": "none",
                  "tos-accept": "true",
                  "withoutAuth": "true"
                },
                "FileFormName": "file",
                "URL": "$json:message.url$",
                "DeletionURL": "$json:message.deleteUrl$",
                "ThumbnailURL": "$json:message.downloadUrl$"
            };
    
            let result;
            if (strToBool(process.env.NEXT_PUBLIC_AUTHORIZATION)) {
              result = await Swal.fire({
                title: 'Your Authorization Token',
                input: 'password',
                inputAttributes: {
                  autocapitalize: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Submit',
                showLoaderOnConfirm: true,
                allowOutsideClick: () => !Swal.isLoading()
              })
            } else result = null;
    
            if (result.value) {
                obj['Headers'] = {};
                obj['Headers']['Authorization'] = result.value;
            }

            setObject(obj);
        }

        set()
    }, []);

    return (
        <div>
            <Head>
                <title>Muploader</title>
                <meta name='description' content='Muploader | Easy to share files' />
                <link rel='icon' href='/favicon.ico' />
            </Head>

            <main>
                <h1 className='title'>
                    ShareX Config
                </h1>

                <Highlight language='json'>
                    {
                        JSON.stringify(object, null, 2)
                    }
                </Highlight>

                <Button color='success' onClick={() => downloadFile()}>Download SXCU</Button>
            </main>
        </div>
    )
}

export default ShareX;