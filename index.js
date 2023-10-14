import { Wallet} from 'ethers';
import fetch from 'node-fetch';
import chalk from 'chalk';
import fs from 'fs';
import readline from 'readline';
import { faker } from '@faker-js/faker'


const commonHeaders = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Connection': 'keep-alive',
    'Origin': 'https://airdrop.nftparis.xyz',
    'Referer': 'https://airdrop.nftparis.xyz/',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36',
    'sec-ch-ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"'
};

let token = "";
let fixname = "";
let randomName = "";
const referralCode = "43832247";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function createWallet() {
    const wallet = Wallet.createRandom();
    const address = wallet.address;
    const privkey = wallet.privateKey;

    return { address, privkey };
}

async function signMessage(privkey, message) {
    const wallet = new Wallet(privkey);
    return await wallet.signMessage(message);
}

async function requestAPI(signature) {
    let retries = 10;
    while (retries > 0) {
        try {
            const response = await fetch('https://nft-paris-backend-412b6eec30d9.herokuapp.com/sign-up', {
                method: 'POST',
                headers: {
                    ...commonHeaders,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'signature': signature
                })
            });

            const responseData = await response.json();
            if (responseData.token) {
                console.log(chalk.green("Session : "), chalk.yellow(responseData.token));
                token = responseData.token;
                return token;
            } else {
                console.log(responseData);
            }
        } catch (error) {
            console.error(chalk.red("Gagal mendaftar. Menunggu sebelum mencoba lagi..."));
            retries--;
        }
    }

    console.error(chalk.red("Gagal mendaftar setelah beberapa percobaan."));
    return token;
}

async function getSummary(token) {
    return new Promise(async (resolve, reject) => {
        let retries = 10; 
        while (retries > 0) {
            try {
                const response = await fetch('https://nft-paris-backend-412b6eec30d9.herokuapp.com/summary', {
                    method:'GET',
                    headers: {
                        ...commonHeaders,
                        'Authorization': `${token}`,
                    }
                });
                console.log(chalk.green("Sukses mendaftar dengan address tersebut"));
                resolve(); 
                return;
            } catch (error) {
                console.error(chalk.red("Gagal mengambil ringkasan akun, menunggu sebelum mencoba lagi..."));
                retries--;
            }
        }
        console.error(chalk.red("Gagal mengambil ringkasan akun setelah beberapa percobaan."));
        reject(); 
    });
}

async function checkReferral() {
    let referralActive = false;
    while (!referralActive) {
        try {
            const response = await fetch(`https://nft-paris-backend-412b6eec30d9.herokuapp.com/check-referral?referral=${referralCode}`, {
                method: 'GET',
                headers: {
                    ...commonHeaders,
                }
            });
            const result = await response.json();
            if (result.exists) {
                console.log(chalk.green("Referral aktif"));
                referralActive = true;
            } else {
                console.log(chalk.red("Referral belum aktif"));
            }
        } catch (error) {
            console.error(chalk.red("Gagal memeriksa referal,  mengulangi sekali lagi..."));
        }
    }
    return referralActive;
}

async function getRandomName() {
    return new Promise((resolve, reject) => {
        try {
            const firstName = faker.person.firstName().replace(/["']/g, "");
            const lastName = faker.person.lastName().replace(/["']/g, "");
            const randomName = (firstName + lastName).toLowerCase();

            if (!randomName) {
                console.error(chalk.red("Gagal mendapatkan nama menggunakan faker."));
                reject("Gagal mendapatkan nama menggunakan faker.");
            } else {
                resolve(randomName);
            }
        } catch (error) {
            console.error(chalk.red("Terjadi kesalahan saat mendapatkan nama menggunakan faker:", error));
            reject(error);
        }
    });
}


async function checkName() {
    let nameExists = true;
    if (randomName === "") {
        randomName = await getRandomName();
        console.log("Nama yang dihasilkan:", randomName);
    }
    while (nameExists) {
        try {
            const response = await fetch(`https://nft-paris-backend-412b6eec30d9.herokuapp.com/check-name?name=${randomName}`, {
                method: 'GET',
                headers: {
                    ...commonHeaders,
                }
            });
            const result = await response.json();
            nameExists = result.exists;
        } catch (error) {
            console.error(chalk.red("Gagal memeriksa nama,  mengulangi sekali lagi..."));
        }
    }
    fixname = randomName;
    console.log(chalk.green(`Username ${randomName} tersedia`));
    return false;
}

async function registerNFT() {
    try {
        const requestBody = JSON.stringify({
            'referral': referralCode,
            'name': `'${fixname}'`,
        });
        console.log(requestBody);

        const response = await fetch('https://nftparis.nftstudios.services/mint', {
            method: 'POST',
            headers: {
                'authority': 'nftparis.nftstudios.services',
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'authorization': token,
                'content-type': 'application/json',
                'origin': 'https://airdrop.nftparis.xyz',
                'referer': 'https://airdrop.nftparis.xyz/',
                'sec-ch-ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': '"Android"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36'
            },
            body: requestBody,
        });
        const responseData = await response.json();
        console.log(chalk.green('Berhasil mendaftarkan akun...', JSON.stringify(responseData, null, 2)));

        const secondResponse = await fetch('https://airdrop.nftparis.xyz/take-test/results/mint/minting/success?_rsc=5zfgr', {
            method: 'GET',
            headers: {
                'authority': 'airdrop.nftparis.xyz',
                'accept': '*/*',
                'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'next-router-state-tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22take-test%22%2C%7B%22children%22%3A%5B%22results%22%2C%7B%22children%22%3A%5B%22mint%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%5D%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
                'next-url': '/take-test/results/mint',
                'referer': 'https://airdrop.nftparis.xyz/take-test/results/mint',
                'rsc': '1',
                'sec-ch-ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': '"Android"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36'
            }
        });
    } catch (error) {
        console.error(chalk.red("Error saat mendaftarkan NFT:", error));
    }
}


async function checkMintStatus(token) {
    try {
        const response = await fetch('https://nftparis.nftstudios.services/mint-status', {
            method: 'GET',
            headers: {
                'authority': 'nftparis.nftstudios.services',
                'accept': 'application/json, text/plain, */*',
                'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'authorization': token, 
                'origin': 'https://airdrop.nftparis.xyz',
                'referer': 'https://airdrop.nftparis.xyz/',
                'sec-ch-ua': '"Chromium";v="118", "Google Chrome";v="118", "Not=A?Brand";v="99"',
                'sec-ch-ua-mobile': '?1',
                'sec-ch-ua-platform': '"Android"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'cross-site',
                'user-agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36'
            }
        });
        const responseText = await response.text();
        console.log(responseText);        
    } catch (error) {
        console.error("Error saat memeriksa status mint:", error);
    }
}


function saveToFile(address, privkey, token) {
    const data = `${address}|${privkey}|${token}\n`; 
    fs.appendFileSync('akun.txt', data, 'utf8');
}

async function main() {
    const walletInfo = createWallet();
    console.log(chalk.green("Address:"), chalk.yellow(walletInfo.address));
    console.log(chalk.green("Private Key:"), chalk.yellow(walletInfo.privkey));
    const message = "Sign this message to log in with your wallet";
    const signature = await signMessage(walletInfo.privkey, message);
    console.log(chalk.green("Signature:"), chalk.yellow(signature));
    const token = await requestAPI(signature);
    saveToFile(walletInfo.address, walletInfo.privkey, token);
    await getSummary(token);
    await checkReferral();
    await getRandomName();
    await checkName();
    await registerNFT();
    await checkMintStatus(token);
}

function runMainMultipleTimes() {
    rl.question('Berapa banyak akun yang ingin Anda buat? ', async (numberOfAccounts) => {
        const count = parseInt(numberOfAccounts, 10);
        
        if (isNaN(count)) {
            console.error("Mohon masukkan angka yang valid.");
            rl.close();
            return;
        }
        
        for (let i = 0; i < count; i++) {
            console.log(chalk.blue(`Membuat akun ke-${i + 1} dari ${count}`));
            await main();
        }
        
        rl.close();
    });
}

runMainMultipleTimes();
