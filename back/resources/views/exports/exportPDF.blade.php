<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{$title}}</title>
    <link rel="stylesheet" href="{{ asset('css/export.css') }}">
</head>
<body>
    
    <h2>{{$title}}</h2>
    <table>
        <thead>
            <tr>
                @if(isset($headers))
                    @foreach($headers as $key => $value)
                        <th>{{$value}}</th>
                    @endforeach
                @endif
            </tr>
        </thead>
        <tbody>
            @if(isset($identifiers) && isset($data) && count($data) > 0)
                @foreach($data as $row)
                    <tr>
                        @foreach($identifiers as $key => $value)
                            <td>
                                {{ $row->$value }}
                            </td>
                        @endforeach
                    </tr>
                @endforeach
            @endif
        </tbody>
    </table>
</body>
</html>