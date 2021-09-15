import * as discord from 'discord.js'
import {
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    StreamType,
} from '@discordjs/voice';
import * as prism from 'prism-media'


const channelId = ""
const token = ""
const client = new discord.Client({
    intents: [discord.Intents.FLAGS.GUILD_VOICE_STATES]
})

function createMicAudioResource(){
    const source = new prism.FFmpeg({
        args: [
            '-loglevel', 'info', // Loglevel
            '-f', 'pulse', '-i', '9', // INPUT
            '-c:a', 'libopus', // Codec (Don't have to change)
            '-f', 'opus', // format (Don't have to change)
            '-ar', '48000', // sample rate
            '-ac', '2', // channels
        ]
    });
    source.process.stderr?.pipe(process.stdout)
    return createAudioResource(
        source,
        {
            inputType: StreamType.OggOpus
        }
    )
}


function isVoice(channel: discord.Channel | null): channel is discord.VoiceChannel{
    return (
        channel !== null
        && channel.type === 'GUILD_VOICE'
    )
}

client.on("ready", async () => {
    try{
        const channel = await client.channels.fetch(channelId)
        if (!isVoice(channel)){
            console.error(`ID: ${channelId} is not voice channel`)
            return
        }
        const player = createAudioPlayer()
        player.on('error', error => {
            console.error('Error:', error.message);
        });
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });
        connection.subscribe(player)
        const source = createMicAudioResource()
        player.play(source)
    } catch (e){
        console.error(e)
        await client.destroy()
    }

})

async function main(){
    await client.login(token)
}

main().then()