#ifndef RN_SOUND_LEVEL_DESKTOP_H
#define RN_SOUND_LEVEL_DESKTOP_H

#include <QUrl>
#include <QtMultimedia/QAudioInput>

#include "moduleinterface.h"
#include "audioinfo.h"

class RNSoundLevelPrivate;

class RNSoundLevel : public QObject, public ModuleInterface {
    Q_OBJECT

    Q_INTERFACES(ModuleInterface)

    Q_DECLARE_PRIVATE(RNSoundLevel)

public:
    Q_INVOKABLE RNSoundLevel(QObject* parent = 0);
    ~RNSoundLevel();

    Q_INVOKABLE void start();
    Q_INVOKABLE void stop();
    Q_INVOKABLE REACT_PROMISE void measure(double successCallback, double errorCallback);

    virtual QString moduleName() override;
    virtual QList<ModuleMethod*> methodsToExport() override;
    virtual QVariantMap constantsToExport() override;
    virtual void setBridge(Bridge* bridge) override;

private:
    QScopedPointer<RNSoundLevelPrivate> d_ptr;

    double frameId;
    QAudioDeviceInfo m_device;
    AudioInfo *m_audioInfo = NULL;
    QAudioFormat m_format;
    QAudioInput *m_audioInput;
    QIODevice *m_input;

private slots:
    void updated();
};

#endif // RN_SOUND_LEVEL_DESKTOP_H
