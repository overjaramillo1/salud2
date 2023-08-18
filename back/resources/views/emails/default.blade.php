<div style="width:100%; background-color:#FFFFFF; height:auto; overflow:hidden; margin:0 auto;font-family:Tahoma,Geneva,sans-serif;">
    <table border="0" align="center" cellpadding="0" cellspacing="0" style="max-width: 752px;width: 90%;">
        <tr>
            <td colspan="4" align="center">
                <img style="width:100%;" src="{{asset('img/mailing/email_top.jpg')}}" />
            </td>
        </tr>
        <tr>
            <td colspan="4">&nbsp;</td>
        </tr>
        <tr align="center">
            <td>&nbsp;</td>
            <td colspan="2" style="text-align:center;">
                <h1>Hola, {{$name}}</h1>
                <br><br>
                
                {!! $html_message !!}
                
                <br /><br />
                <p style="color:#B7B7B7; text-align: center; font-size: 14px;">Este mensaje es generado automaticamente desde la plataforma<br>
                <a href="{{asset('/')}}" style="color:#ED1849;">Innbase</a> cualquier inquietud o inconsistencia contáctanos al correo <span style="color:#ED1849;">contacto@cinnco.co</span></p>
            </td>
            <td>&nbsp;</td>
        </tr>
        <tr>
            <td colspan="4">&nbsp;</td>
        </tr>
        <tr>
            <td colspan="4" align="center">
                <img style="height: 80px;" src="{{asset('img/mailing/email_foot.jpg')}}" />
            </td>
        </tr>
    </table>
</div>